import type { Env } from "./types";
import { createDigestWithAI, summarizeArticle } from "./ai";
import { clampText, readingMinutes, shortHash, slugify, stripHtml } from "./utils";

function extractMainHtml(html: string) {
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<(nav|footer|header|form|aside|svg)[\s\S]*?<\/\1>/gi, " ");
  const main = cleaned.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)?.[1]
    ?? cleaned.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1]
    ?? cleaned.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1]
    ?? cleaned;
  return clampText(stripHtml(main), 18000);
}

async function fetchArticleText(url: string, fallback: string) {
  try {
    const response = await fetch(url, {
      headers: {
        "user-agent": "AI-Compass-Knowledge-Bot/0.2",
        accept: "text/html,application/xhtml+xml,text/plain;q=0.8,*/*;q=0.5",
      },
      redirect: "follow",
      cf: { cacheTtl: 600, cacheEverything: true },
    });
    if (!response.ok) throw new Error(`Article HTTP ${response.status}`);
    const contentLength = Number(response.headers.get("content-length") || 0);
    if (contentLength > 5_000_000) throw new Error("Article is larger than 5 MB");
    const contentType = response.headers.get("content-type") || "";
    const raw = await response.text();
    const text = contentType.includes("html") ? extractMainHtml(raw) : clampText(raw, 18000);
    return text.length >= 180 ? text : clampText(fallback, 18000);
  } catch (error) {
    console.warn("Article fetch fallback", url, error);
    return clampText(fallback, 18000);
  }
}

function isAiFocusedSource(sourceName: string) {
  return /OpenAI|DeepMind|Hugging Face|arXiv|AI & ML|Machine Learning|量子位|人工智能|大模型|NVIDIA/i.test(sourceName);
}

function looksAiRelevant(text: string) {
  return /\b(ai|artificial intelligence|machine learning|deep learning|llm|large language model|generative ai|agentic|agent|transformer|neural|multimodal|rag|embedding|inference|foundation model|computer vision|robotics)\b|人工智能|大模型|生成式|智能体|机器学习|深度学习|神经网络|多模态|模型训练|模型推理|算力|芯片|机器人|提示词|知识库|向量数据库|具身智能|自动驾驶/i.test(text);
}

export async function processSourceItem(env: Env, sourceItemId: number, force = false) {
  const item = await env.DB.prepare(`
    SELECT si.*, s.name AS source_name, s.site_url
    FROM source_items si JOIN sources s ON s.id = si.source_id
    WHERE si.id = ?
  `).bind(sourceItemId).first<{
    id: number;
    source_id: number;
    title: string;
    url: string;
    description: string;
    published_at: string;
    source_name: string;
    site_url: string;
    status: string;
  }>();
  if (!item || (!force && item.status === "processed")) return;

  const relevanceText = `${item.source_name} ${item.title} ${item.description}`;
  if (!force && !isAiFocusedSource(item.source_name) && !looksAiRelevant(relevanceText)) {
    await env.DB.prepare("UPDATE source_items SET status = 'ignored', error = 'not_ai_relevant', processed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .bind(item.id).run();
    return;
  }

  await env.DB.prepare("UPDATE source_items SET status = 'processing', error = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(item.id).run();
  try {
    const originalContent = await fetchArticleText(item.url, item.description);
    const analysis = await summarizeArticle(env, {
      title: item.title,
      description: item.description,
      content: originalContent,
      sourceName: item.source_name,
    });

    if (!analysis.isAiRelevant) {
      await env.DB.prepare("UPDATE source_items SET status = 'ignored', error = 'not_ai_relevant', processed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
        .bind(item.id).run();
      return;
    }

    const category = await env.DB.prepare("SELECT id FROM categories WHERE slug = ?").bind(analysis.categorySlug).first<{ id: number }>()
      ?? await env.DB.prepare("SELECT id FROM categories WHERE slug = 'products'").first<{ id: number }>();
    if (!category) throw new Error("Categories have not been seeded");

    const hash = await shortHash(item.url);
    const slug = slugify(item.title, hash.slice(0, 8));
    const status = env.ENABLE_AUTO_PUBLISH === "false" ? "draft" : "published";
    const translatedContent = analysis.translatedContent || originalContent;
    await env.DB.prepare(`
      INSERT INTO articles
        (source_id, source_item_id, category_id, slug, title, summary, why_it_matters, content,
         original_title, original_content, source_language, source_name, source_url,
         tags_json, confidence, reading_minutes, published_at, status, content_type, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'news', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT(source_item_id) DO UPDATE SET
        category_id = excluded.category_id,
        title = excluded.title,
        summary = excluded.summary,
        why_it_matters = excluded.why_it_matters,
        content = excluded.content,
        original_title = excluded.original_title,
        original_content = excluded.original_content,
        source_language = excluded.source_language,
        tags_json = excluded.tags_json,
        confidence = excluded.confidence,
        reading_minutes = excluded.reading_minutes,
        status = excluded.status,
        content_type = 'news',
        updated_at = CURRENT_TIMESTAMP
    `).bind(
      item.source_id,
      item.id,
      category.id,
      slug,
      analysis.translatedTitle || item.title,
      analysis.summary,
      analysis.whyItMatters,
      translatedContent,
      item.title,
      originalContent,
      analysis.sourceLanguage,
      item.source_name,
      item.url,
      JSON.stringify(analysis.tags),
      analysis.confidence,
      readingMinutes(translatedContent),
      item.published_at,
      status,
    ).run();
    await env.DB.prepare("UPDATE source_items SET status = 'processed', processed_at = CURRENT_TIMESTAMP, error = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(item.id).run();
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "Unknown processing error";
    await env.DB.prepare("UPDATE source_items SET status = 'failed', error = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(clampText(message, 500), item.id).run();
    throw cause;
  }
}

export async function generateDigestIfDue(env: Env, type: "daily" | "weekly", force = false) {
  const isWeekly = type === "weekly";
  const minIntervalHours = isWeekly ? 6 * 24 : 20;
  const latest = await env.DB.prepare(
    "SELECT published_at FROM briefs WHERE brief_type = ? AND status = 'published' ORDER BY datetime(published_at) DESC LIMIT 1",
  ).bind(type).first<{ published_at: string }>();

  if (!force && latest && Date.now() - new Date(latest.published_at).getTime() < minIntervalHours * 60 * 60 * 1000) {
    return { created: false, reason: "not_due" };
  }

  const window = isWeekly ? "-8 days" : "-36 hours";
  const limit = isWeekly ? 50 : 30;
  const result = await env.DB.prepare(`
    SELECT a.slug, a.title, a.summary, a.why_it_matters, a.source_name, a.confidence,
           COALESCE(s.trust_level, 3) AS trust_level
    FROM articles a
    LEFT JOIN sources s ON s.id = a.source_id
    WHERE a.status = 'published'
      AND a.content_type = 'news'
      AND (datetime(a.published_at) >= datetime('now', ?) OR datetime(a.created_at) >= datetime('now', ?))
    ORDER BY
      COALESCE(s.trust_level, 3) DESC,
      CASE a.confidence WHEN 'high' THEN 3 WHEN 'medium' THEN 2 ELSE 1 END DESC,
      datetime(a.created_at) DESC,
      datetime(a.published_at) DESC
    LIMIT ?
  `).bind(window, window, limit).all<{
    slug: string;
    title: string;
    summary: string;
    why_it_matters: string;
    source_name: string;
    confidence: string;
    trust_level: number;
  }>();

  const articles = result.results ?? [];
  if (!articles.length) return { created: false, reason: "no_articles" };

  const digest = await createDigestWithAI(env, type, articles);
  const periodEnd = new Date();
  const periodStart = new Date(periodEnd.getTime() - (isWeekly ? 7 : 1) * 24 * 60 * 60 * 1000);
  await env.DB.prepare(`
    INSERT INTO briefs (brief_type, title, intro, highlights_json, period_start, period_end, status, published_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 'published', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `).bind(type, digest.title, digest.intro, JSON.stringify(digest.highlights), periodStart.toISOString(), periodEnd.toISOString()).run();
  return { created: true, count: articles.length, type };
}
