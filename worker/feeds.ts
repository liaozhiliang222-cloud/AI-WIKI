import { XMLParser } from "fast-xml-parser";
import type { Env, FeedItem } from "./types";
import { clampText, safeDate, shortHash, stripHtml } from "./utils";

type UnknownRecord = Record<string, unknown>;

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  trimValues: true,
  parseTagValue: false,
  processEntities: true,
});

function arrayify<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function textValue(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (value && typeof value === "object") {
    const object = value as UnknownRecord;
    return String(object["#text"] ?? object["@_href"] ?? object["@_url"] ?? "");
  }
  return "";
}

function linkValue(value: unknown): string {
  if (typeof value === "string") return value;
  for (const link of arrayify(value as UnknownRecord | UnknownRecord[] | undefined)) {
    if (typeof link === "string") return link;
    if (!link || typeof link !== "object") continue;
    const href = textValue(link["@_href"] ?? link["#text"]);
    const rel = textValue(link["@_rel"]);
    if (href && (!rel || rel === "alternate")) return href;
  }
  return "";
}

export async function parseFeed(xml: string): Promise<FeedItem[]> {
  const data = parser.parse(xml) as UnknownRecord;
  const rssChannel = (data.rss as UnknownRecord | undefined)?.channel as UnknownRecord | undefined;
  const rdf = data["rdf:RDF"] as UnknownRecord | undefined;
  const atom = data.feed as UnknownRecord | undefined;
  const rawItems = rssChannel?.item ?? rdf?.item ?? atom?.entry ?? [];

  const normalized: FeedItem[] = [];
  for (const raw of arrayify(rawItems as UnknownRecord | UnknownRecord[])) {
    if (!raw || typeof raw !== "object") continue;
    const title = stripHtml(textValue(raw.title)).trim();
    const url = linkValue(raw.link) || textValue(raw.guid) || textValue(raw.id);
    if (!title || !url || !/^https?:\/\//i.test(url)) continue;
    const description = stripHtml(textValue(raw.description ?? raw.summary ?? raw.content ?? raw["content:encoded"]));
    const publishedAt = safeDate(textValue(raw.pubDate ?? raw.published ?? raw.updated ?? raw.date ?? raw["dc:date"]));
    const identity = textValue(raw.guid ?? raw.id) || url;
    normalized.push({
      externalId: await shortHash(identity),
      title: clampText(title, 300),
      url,
      publishedAt,
      description: clampText(description, 2500),
      author: clampText(textValue(raw.author ?? raw["dc:creator"]), 160),
    });
  }
  return normalized.slice(0, 30);
}

export async function scanAllSources(env: Env) {
  const result = await env.DB.prepare("SELECT id FROM sources WHERE active = 1 ORDER BY trust_level DESC, id ASC").all<{ id: number }>();
  const jobs = (result.results ?? []).map((source) => ({ body: { type: "scan_source", sourceId: source.id } as const }));
  if (jobs.length) await env.CONTENT_QUEUE.sendBatch(jobs);
  return jobs.length;
}

export async function scanSource(env: Env, sourceId: number) {
  const source = await env.DB.prepare("SELECT * FROM sources WHERE id = ? AND active = 1").bind(sourceId).first<{
    id: number; name: string; feed_url: string;
  }>();
  if (!source) return { discovered: 0 };

  const checkedAt = new Date().toISOString();
  try {
    const response = await fetch(source.feed_url, {
      headers: {
        "user-agent": "AI-Compass-Knowledge-Bot/0.1 (+https://example.com/bot)",
        accept: "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.5",
      },
      cf: { cacheTtl: 300, cacheEverything: true },
    });
    if (!response.ok) throw new Error(`Feed HTTP ${response.status}`);
    const xml = await response.text();
    const items = await parseFeed(xml);
    let discovered = 0;

    for (const item of items) {
      const insert = await env.DB.prepare(`
        INSERT OR IGNORE INTO source_items
          (source_id, external_id, title, url, description, author, published_at, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).bind(source.id, item.externalId, item.title, item.url, item.description, item.author, item.publishedAt).run();

      if ((insert.meta.changes ?? 0) > 0) {
        const row = await env.DB.prepare("SELECT id FROM source_items WHERE source_id = ? AND external_id = ?").bind(source.id, item.externalId).first<{ id: number }>();
        if (row) {
          await env.CONTENT_QUEUE.send({ type: "process_item", sourceItemId: row.id });
          discovered += 1;
        }
      }
    }

    await env.DB.prepare("UPDATE sources SET last_checked_at = ?, last_success_at = ?, last_error = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .bind(checkedAt, checkedAt, source.id).run();
    return { discovered };
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "Unknown feed error";
    await env.DB.prepare("UPDATE sources SET last_checked_at = ?, last_error = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .bind(checkedAt, clampText(message, 500), source.id).run();
    throw cause;
  }
}
