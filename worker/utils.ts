import type { ArticleRow } from "./types";

export function json(data: unknown, status = 200, extraHeaders: HeadersInit = {}) {
  return Response.json(data, {
    status,
    headers: {
      "cache-control": status === 200 ? "no-store" : "no-cache",
      ...extraHeaders,
    },
  });
}

export function error(message: string, status = 400) {
  return json({ error: message }, status);
}

export function normalizeArticle(row: ArticleRow) {
  let tags: string[] = [];
  try {
    tags = JSON.parse(row.tags_json || "[]") as string[];
  } catch {
    tags = [];
  }
  const { tags_json: _tagsJson, ...article } = row;
  return { ...article, tags };
}

export function slugify(title: string, suffix = "") {
  const latin = title
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 58);
  return `${latin || "article"}${suffix ? `-${suffix}` : ""}`;
}

export async function shortHash(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).slice(0, 6).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function clampText(value: string, max: number) {
  const cleaned = value.replace(/\s+/g, " ").trim();
  return cleaned.length <= max ? cleaned : `${cleaned.slice(0, max).trim()}…`;
}

export function stripHtml(value: string) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function safeDate(value?: string | null) {
  if (!value) return new Date().toISOString();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

export function isAuthorized(request: Request, token: string) {
  if (!token) return false;
  const auth = request.headers.get("authorization") || "";
  return auth === `Bearer ${token}`;
}

export function parseJsonFromModel(text: string) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const candidate = fenced || text.match(/\{[\s\S]*\}/)?.[0] || text;
  return JSON.parse(candidate.trim()) as Record<string, unknown>;
}

export function readingMinutes(content: string) {
  return Math.max(2, Math.ceil(content.length / 650));
}
