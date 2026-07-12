-- 清理初始化演示资讯，避免它们再次进入真实日报/周报。
UPDATE articles
SET status = 'archived', updated_at = CURRENT_TIMESTAMP
WHERE content_type = 'news'
  AND (slug LIKE 'demo-news-%' OR source_name = 'AI Compass 产品演示');

-- 归档由演示资讯生成的旧简报，包括标题已被AI改写、但仍引用 demo-news slug 的简报。
UPDATE briefs
SET status = 'archived', updated_at = CURRENT_TIMESTAMP
WHERE title LIKE '%产品初始化演示版%'
   OR highlights_json LIKE '%demo-news-%'
   OR highlights_json LIKE '%日报与周报功能区分%'
   OR highlights_json LIKE '%资讯抓取系统升级%'
   OR highlights_json LIKE '%知识库与资讯库分离%';

CREATE INDEX IF NOT EXISTS idx_articles_real_news_digest
  ON articles(content_type, status, source_item_id, created_at DESC, published_at DESC);
