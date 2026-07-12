import type { Article, ContentType, Dashboard, Digest, DigestType, Source } from "./types";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    cache: "no-store",
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: response.statusText })) as { error?: string };
    throw new Error(body.error || `请求失败：${response.status}`);
  }
  return response.json() as Promise<T>;
}

export const api = {
  dashboard: () => request<Dashboard>("/api/dashboard"),
  articles: (query = "", category = "", contentType?: ContentType) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (category) params.set("category", category);
    if (contentType) params.set("type", contentType);
    params.set("limit", "60");
    return request<{ articles: Article[] }>(`/api/articles?${params}`);
  },
  article: (slug: string) => request<{ article: Article }>(`/api/articles/${encodeURIComponent(slug)}`),
  latestDigest: (type: DigestType) => request<{ digest: Digest | null }>(`/api/digests/latest?type=${type}`),
  ask: (question: string) => request<{ answer: string; sources: Article[] }>("/api/ask", {
    method: "POST",
    body: JSON.stringify({ question }),
  }),
  sources: (token: string) => request<{ sources: Source[] }>("/api/admin/sources", {
    headers: { authorization: `Bearer ${token}` },
  }),
  addSource: (token: string, source: Partial<Source>) => request<{ source: Source }>("/api/admin/sources", {
    method: "POST",
    headers: { authorization: `Bearer ${token}` },
    body: JSON.stringify(source),
  }),
  scan: (token: string) => request<{ queued: number }>("/api/admin/scan", {
    method: "POST",
    headers: { authorization: `Bearer ${token}` },
    body: JSON.stringify({}),
  }),
  retranslate: (token: string) => request<{ queued: number }>("/api/admin/retranslate", {
    method: "POST",
    headers: { authorization: `Bearer ${token}` },
    body: JSON.stringify({}),
  }),
  generateDigest: (token: string, type: DigestType) => request<{ created: boolean; count?: number; reason?: string }>(`/api/admin/digests/${type}`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}` },
    body: JSON.stringify({}),
  }),
};
