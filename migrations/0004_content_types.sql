ALTER TABLE articles ADD COLUMN content_type TEXT NOT NULL DEFAULT 'knowledge';

UPDATE articles
SET content_type = CASE
  WHEN source_item_id IS NOT NULL THEN 'news'
  ELSE 'knowledge'
END;

CREATE INDEX IF NOT EXISTS idx_articles_content_type
  ON articles(content_type, status, updated_at DESC);

INSERT OR IGNORE INTO articles
  (id, source_id, category_id, slug, title, summary, why_it_matters, content, source_name, source_url, tags_json, confidence, reading_minutes, published_at, status, content_type, created_at, updated_at)
VALUES
  (101, 1, 2, 'demo-news-knowledge-update', '演示资讯：知识内容与动态资讯已拆分管理',
   '新版同时保留长期有效的AI知识库和自动抓取的资讯库，日报与周报只从动态资讯中生成。',
   '用户既能系统学习基础知识，也能及时跟踪新变化，避免产品退化为单纯新闻聚合器。',
   '这是一条用于演示产品结构的资讯。正式部署后，RSS与Atom抓取内容会自动进入资讯库，而编辑型、长期有效的内容会保存在AI知识库。\n\n资讯日报和精品周报仅使用动态资讯生成，AI问答则可以同时检索知识库和资讯库。',
   'AI Compass 产品演示', 'https://example.com', '["产品结构","知识库","资讯库"]', 'high', 3, datetime('now','-5 hours'), 'published', 'news', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (102, 1, 3, 'demo-news-pipeline', '演示资讯：Cron、Queues与失败重试链路已保留',
   '定时任务负责发现新内容，Queues异步完成正文提取、去重、AI摘要、分类、标签和入库。',
   '抓取和AI处理分离后，单个网站失败不会拖垮整批任务，也便于限制成本与排查问题。',
   '这是用于展示后台处理能力的演示资讯。系统每六小时检查一次启用的信息源，发现新条目后写入队列。\n\n队列消费者会读取网页、清洗正文、调用AI整理并写入D1；失败任务按配置重试，超过次数后进入死信队列。',
   'AI Compass 产品演示', 'https://example.com', '["Cron","Queues","失败重试"]', 'high', 3, datetime('now','-3 hours'), 'published', 'news', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (103, 1, 3, 'demo-news-daily-weekly', '演示资讯：日报负责及时，周报负责精品筛选',
   '日报汇总过去24小时变化，周报从一周内容中挑选真正重要、具有持续价值的资讯。',
   '两种内容满足不同阅读节奏，同时所有原始资讯仍可在资讯库中搜索和回溯。',
   '日报适合每天三分钟快速浏览；精品周报适合每周集中阅读。两者都保留对应资讯条目的链接，所有原始条目也会进入资讯库。',
   'AI Compass 产品演示', 'https://example.com', '["资讯日报","精品周报","内容筛选"]', 'high', 3, datetime('now','-1 hour'), 'published', 'news', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

UPDATE briefs SET highlights_json =
  '[{"title":"知识内容与动态资讯已拆分管理","summary":"长期知识用于系统学习，动态资讯用于追踪变化；日报与周报只从资讯库生成。","article_slug":"demo-news-knowledge-update"},{"title":"抓取与处理链路全部保留","summary":"Cron发现更新，Queues完成抓取、正文清洗、去重、AI摘要、分类和入库。","article_slug":"demo-news-pipeline"},{"title":"日报及时、周报精选","summary":"日报服务每日快速阅读，精品周报筛选一周真正重要的内容。","article_slug":"demo-news-daily-weekly"}]'
WHERE id IN (1, 2);
