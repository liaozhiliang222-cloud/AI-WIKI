-- ============================================================
-- 0013: 日报/周报内容面向“AI应用”优化
-- 1) articles 新增 audience_value 字段：
--    consumer=普通消费者可直接使用/体验的AI应用与功能；
--    professional=面向专业工作者的AI应用与工作流；
--    technical=模型发布、论文与底层技术（普通人无法直接使用）。
--    存量内容默认 professional，由后续重处理逐步更新。
-- 2) 新增 AI 应用类资讯源（feed 均已验证可用）。
-- 3) arXiv 论文源降权（trust 5 -> 2），避免论文淹没应用类内容。
-- 安全：不删除任何文章/资讯/来源，不影响队列与其他字段。
-- ============================================================

ALTER TABLE articles ADD COLUMN audience_value TEXT NOT NULL DEFAULT 'professional';

CREATE INDEX IF NOT EXISTS idx_articles_audience_value
  ON articles(audience_value, content_type, status, updated_at DESC);

-- 2. AI 应用类资讯源（普通用户可感知的工具、产品、落地案例）
INSERT OR IGNORE INTO sources (name, feed_url, site_url, source_type, trust_level, active) VALUES
  ('小众软件', 'https://www.appinn.com/feed/', 'https://www.appinn.com/', 'rss', 4, 1),
  ('TechCrunch AI', 'https://techcrunch.com/category/artificial-intelligence/feed/', 'https://techcrunch.com/category/artificial-intelligence/', 'rss', 4, 1),
  ('The Verge AI', 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', 'https://www.theverge.com/', 'rss', 4, 1),
  ('VentureBeat AI', 'https://venturebeat.com/category/ai/feed/', 'https://venturebeat.com/category/ai/', 'rss', 4, 1),
  ('机器之心', 'https://www.jiqizhixin.com/rss', 'https://www.jiqizhixin.com/', 'rss', 4, 1);

-- 3. arXiv 论文源降权：论文仍可检索，但不再优先进入日报/周报候选
UPDATE sources
SET trust_level = 2,
    updated_at = CURRENT_TIMESTAMP
WHERE name IN ('arXiv cs.AI', 'arXiv cs.LG', 'arXiv cs.CL');
