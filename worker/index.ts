import { answerWithKnowledge } from "./ai";
import { scanAllSources, scanSource } from "./feeds";
import { generateDigestIfDue, processSourceItem, queueUntranslatedNews } from "./pipeline";
import type { ArticleRow, Env, QueueJob } from "./types";
import { error, isAuthorized, json, normalizeArticle } from "./utils";

const ARTICLE_SELECT = `
  SELECT a.id, a.slug, a.title, a.summary, a.why_it_matters, a.content,
         a.original_title, a.original_content, a.source_language, a.source_name, a.source_url,
         a.published_at, a.updated_at, c.slug AS category_slug, c.name AS category_name,
         a.tags_json, a.reading_minutes, a.confidence, a.content_type
  FROM articles a JOIN categories c ON c.id = a.category_id
`;

function parseBrief<T extends { highlights_json: string }>(row: T | null) {
  if (!row) return null;
  const { highlights_json, ...brief } = row;
  let highlights: unknown[] = [];
  try { highlights = JSON.parse(highlights_json) as unknown[]; } catch { highlights = []; }
  return { ...brief, highlights };
}

async function dashboard(env: Env) {
  const [stats, categories, knowledge, news, daily, weekly] = await Promise.all([
    env.DB.prepare(`
      SELECT
        (SELECT COUNT(*) FROM articles WHERE status = 'published' AND content_type = 'knowledge') AS knowledge_count,
        (SELECT COUNT(*) FROM articles WHERE status = 'published' AND content_type = 'news') AS news_count,
        (SELECT COUNT(*) FROM sources WHERE active = 1) AS source_count,
        (SELECT COUNT(*) FROM articles WHERE status = 'published' AND datetime(updated_at) >= datetime('now', '-7 days')) AS updated_in_7d,
        (SELECT COUNT(*) FROM categories) AS category_count
    `).first(),
    env.DB.prepare(`
      SELECT c.id, c.slug, c.name, c.description, COUNT(a.id) AS article_count
      FROM categories c
      LEFT JOIN articles a ON a.category_id = c.id AND a.status = 'published' AND a.content_type = 'knowledge'
      GROUP BY c.id ORDER BY c.sort_order ASC
    `).all(),
    env.DB.prepare(`${ARTICLE_SELECT} WHERE a.status = 'published' AND a.content_type = 'knowledge' ORDER BY datetime(a.updated_at) DESC LIMIT 8`).all<ArticleRow>(),
    env.DB.prepare(`${ARTICLE_SELECT} WHERE a.status = 'published' AND a.content_type = 'news' ORDER BY datetime(a.published_at) DESC LIMIT 8`).all<ArticleRow>(),
    env.DB.prepare("SELECT id, brief_type, title, intro, highlights_json, period_start, period_end, published_at FROM briefs WHERE status = 'published' AND brief_type = 'daily' ORDER BY datetime(published_at) DESC LIMIT 1").first<{ id: number; brief_type: "daily"; title: string; intro: string; highlights_json: string; period_start: string; period_end: string; published_at: string }>(),
    env.DB.prepare("SELECT id, brief_type, title, intro, highlights_json, period_start, period_end, published_at FROM briefs WHERE status = 'published' AND brief_type = 'weekly' ORDER BY datetime(published_at) DESC LIMIT 1").first<{ id: number; brief_type: "weekly"; title: string; intro: string; highlights_json: string; period_start: string; period_end: string; published_at: string }>(),
  ]);
  return json({
    stats: stats ?? { knowledge_count: 0, news_count: 0, source_count: 0, updated_in_7d: 0, category_count: 0 },
    categories: categories.results ?? [],
    latest_knowledge: (knowledge.results ?? []).map(normalizeArticle),
    latest_news: (news.results ?? []).map(normalizeArticle),
    latest_daily: parseBrief(daily),
    latest_weekly: parseBrief(weekly),
  });
}

async function listArticles(request: Request, env: Env) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") || "").trim().slice(0, 100);
  const category = (url.searchParams.get("category") || "").trim().slice(0, 50);
  const contentType = url.searchParams.get("type");
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 30), 1), 100);
  const where = ["a.status = 'published'"];
  const bindings: unknown[] = [];
  if (q) {
    where.push("(a.title LIKE ? OR a.summary LIKE ? OR a.content LIKE ? OR a.tags_json LIKE ?)");
    const term = `%${q}%`;
    bindings.push(term, term, term, term);
  }
  if (category) {
    where.push("c.slug = ?");
    bindings.push(category);
  }
  if (contentType === "knowledge" || contentType === "news") {
    where.push("a.content_type = ?");
    bindings.push(contentType);
  }
  bindings.push(limit);
  const result = await env.DB.prepare(`${ARTICLE_SELECT} WHERE ${where.join(" AND ")} ORDER BY datetime(a.updated_at) DESC LIMIT ?`)
    .bind(...bindings).all<ArticleRow>();
  return json({ articles: (result.results ?? []).map(normalizeArticle) });
}

async function getArticle(slug: string, env: Env) {
  const row = await env.DB.prepare(`${ARTICLE_SELECT} WHERE a.slug = ? AND a.status = 'published' LIMIT 1`).bind(slug).first<ArticleRow>();
  return row ? json({ article: normalizeArticle(row) }) : error("未找到这条内容。", 404);
}

function ngrams(value: string) {
  const normalized = value.toLowerCase().replace(/\s+/g, "");
  const grams = new Set<string>();
  for (let size = 2; size <= 4; size += 1) {
    for (let index = 0; index <= normalized.length - size; index += 1) grams.add(normalized.slice(index, index + size));
  }
  return grams;
}

async function ask(request: Request, env: Env) {
  const body = await request.json().catch(() => ({})) as { question?: string };
  const question = (body.question || "").trim();
  if (question.length < 2) return error("问题至少需要2个字。", 422);
  if (question.length > 500) return error("问题过长，请控制在500字以内。", 422);
  const result = await env.DB.prepare(`${ARTICLE_SELECT} WHERE a.status = 'published' ORDER BY datetime(a.updated_at) DESC LIMIT 100`).all<ArticleRow>();
  const questionGrams = ngrams(question);
  const ranked = (result.results ?? []).map((row) => {
    const article = normalizeArticle(row);
    const titleGrams = ngrams(article.title);
    const bodyGrams = ngrams(`${article.summary}${article.tags.join("")}${article.content.slice(0, 2500)}`);
    let score = 0;
    questionGrams.forEach((gram) => { if (titleGrams.has(gram)) score += 4; if (bodyGrams.has(gram)) score += 1; });
    return { article, score };
  }).sort((a, b) => b.score - a.score).slice(0, 5);
  const sources = ranked.filter((item) => item.score > 0).map((item) => item.article);
  const contextSources = sources.length ? sources : ranked.slice(0, 3).map((item) => item.article);
  const answer = await answerWithKnowledge(env, question, contextSources.map((article) => ({
    title: article.title,
    summary: article.summary,
    content: article.content,
    source: article.source_name,
  })));
  return json({ answer, sources: contextSources });
}

async function listSources(request: Request, env: Env) {
  if (!isAuthorized(request, env.ADMIN_TOKEN)) return error("管理员令牌无效。", 401);
  const result = await env.DB.prepare("SELECT id, name, feed_url, site_url, source_type, trust_level, active, last_checked_at, last_success_at, last_error FROM sources ORDER BY trust_level DESC, name ASC").all();
  return json({ sources: result.results ?? [] });
}

function isSafeFeedUrl(value: string) {
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) return false;
    const host = url.hostname.toLowerCase();
    if (host === "localhost" || host.endsWith(".local") || host === "0.0.0.0" || host === "127.0.0.1" || host === "::1") return false;
    if (/^(10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host)) return false;
    return true;
  } catch { return false; }
}

async function addSource(request: Request, env: Env) {
  if (!isAuthorized(request, env.ADMIN_TOKEN)) return error("管理员令牌无效。", 401);
  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  const name = String(body.name || "").trim().slice(0, 120);
  const feedUrl = String(body.feed_url || "").trim();
  const siteUrl = String(body.site_url || "").trim();
  if (!name || !isSafeFeedUrl(feedUrl)) return error("请填写有效的来源名称和公开Feed地址。", 422);
  if (siteUrl && !isSafeFeedUrl(siteUrl)) return error("官网地址格式无效。", 422);
  const trust = Math.min(Math.max(Number(body.trust_level || 4), 1), 5);
  const insert = await env.DB.prepare(`
    INSERT INTO sources (name, feed_url, site_url, source_type, trust_level, active, created_at, updated_at)
    VALUES (?, ?, ?, 'rss', ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `).bind(name, feedUrl, siteUrl || new URL(feedUrl).origin, trust).run();
  const source = await env.DB.prepare("SELECT id, name, feed_url, site_url, source_type, trust_level, active, last_checked_at, last_success_at, last_error FROM sources WHERE id = ?").bind(insert.meta.last_row_id).first();
  return json({ source }, 201);
}

async function manualScan(request: Request, env: Env) {
  if (!isAuthorized(request, env.ADMIN_TOKEN)) return error("管理员令牌无效。", 401);
  const queued = await scanAllSources(env);
  return json({ queued });
}

async function retranslateRecent(request: Request, env: Env) {
  if (!isAuthorized(request, env.ADMIN_TOKEN)) return error("管理员令牌无效。", 401);
  const queued = await queueUntranslatedNews(env, 100);
  return json({ queued });
}

async function handleFetch(request: Request, env: Env) {
  const url = new URL(request.url);
  const path = url.pathname;
  if (request.method === "GET" && path === "/api/health") return json({ ok: true, app: env.APP_NAME || "AI Compass", time: new Date().toISOString() });
  if (request.method === "GET" && path === "/api/dashboard") return dashboard(env);
  if (request.method === "GET" && path === "/api/articles") return listArticles(request, env);
  if (request.method === "GET" && path.startsWith("/api/articles/")) return getArticle(decodeURIComponent(path.slice("/api/articles/".length)), env);
  if (request.method === "GET" && path === "/api/digests/latest") {
    const type = url.searchParams.get("type") === "weekly" ? "weekly" : "daily";
    const row = await env.DB.prepare("SELECT id, brief_type, title, intro, highlights_json, period_start, period_end, published_at FROM briefs WHERE status = 'published' AND brief_type = ? ORDER BY datetime(published_at) DESC LIMIT 1")
      .bind(type)
      .first<{ id: number; brief_type: "daily" | "weekly"; title: string; intro: string; highlights_json: string; period_start: string; period_end: string; published_at: string }>();
    return json({ digest: parseBrief(row) });
  }
  if (request.method === "GET" && path === "/api/briefs/latest") {
    const row = await env.DB.prepare("SELECT id, brief_type, title, intro, highlights_json, period_start, period_end, published_at FROM briefs WHERE status = 'published' AND brief_type = 'daily' ORDER BY datetime(published_at) DESC LIMIT 1")
      .first<{ id: number; brief_type: "daily"; title: string; intro: string; highlights_json: string; period_start: string; period_end: string; published_at: string }>();
    return json({ brief: parseBrief(row) });
  }
  if (request.method === "POST" && path === "/api/ask") return ask(request, env);
  if (request.method === "GET" && path === "/api/admin/sources") return listSources(request, env);
  if (request.method === "POST" && path === "/api/admin/sources") return addSource(request, env);
  if (request.method === "POST" && path === "/api/admin/scan") return manualScan(request, env);
  if (request.method === "POST" && path === "/api/admin/retranslate") return retranslateRecent(request, env);
  if (request.method === "POST" && path.startsWith("/api/admin/digests/")) {
    if (!isAuthorized(request, env.ADMIN_TOKEN)) return error("管理员令牌无效。", 401);
    const type = path.endsWith("/weekly") ? "weekly" : path.endsWith("/daily") ? "daily" : null;
    if (!type) return error("简报类型无效。", 422);
    return json(await generateDigestIfDue(env, type, true));
  }
  if (request.method === "POST" && path === "/api/admin/brief") {
    if (!isAuthorized(request, env.ADMIN_TOKEN)) return error("管理员令牌无效。", 401);
    return json(await generateDigestIfDue(env, "daily", true));
  }
  return error("API路径不存在。", 404);
}

export default {
  async fetch(request: Request, env: Env) {
    try {
      return await handleFetch(request, env);
    } catch (cause) {
      console.error("API error", cause);
      const message = cause instanceof Error ? cause.message : "Internal error";
      return error(`服务暂时不可用：${message}`, 500);
    }
  },

  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    if (controller.cron === "0 */6 * * *") {
      ctx.waitUntil(Promise.all([scanAllSources(env), queueUntranslatedNews(env, 20)]));
    } else if (controller.cron === "30 0 * * *") ctx.waitUntil(generateDigestIfDue(env, "daily"));
    else if (controller.cron === "0 1 * * SUN") ctx.waitUntil(generateDigestIfDue(env, "weekly"));
  },

  async queue(batch: MessageBatch<QueueJob>, env: Env) {
    for (const message of batch.messages) {
      try {
        if (message.body.type === "scan_source") await scanSource(env, message.body.sourceId);
        if (message.body.type === "process_item") await processSourceItem(env, message.body.sourceItemId);
        if (message.body.type === "reprocess_item") await processSourceItem(env, message.body.sourceItemId, true);
        message.ack();
      } catch (cause) {
        console.error("Queue job failed", message.body, cause);
        message.retry({ delaySeconds: 60 });
      }
    }
  },
} satisfies ExportedHandler<Env, QueueJob>;
