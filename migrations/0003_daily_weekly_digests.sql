ALTER TABLE briefs ADD COLUMN brief_type TEXT NOT NULL DEFAULT 'daily';

CREATE INDEX IF NOT EXISTS idx_briefs_type_published
  ON briefs(brief_type, status, published_at DESC);

UPDATE briefs SET brief_type = 'daily' WHERE brief_type IS NULL OR brief_type = '';

INSERT OR IGNORE INTO briefs
  (id, brief_type, title, intro, highlights_json, period_start, period_end, status, published_at)
VALUES
  (2, 'weekly', '本周AI精品资讯 · 产品初始化演示版',
   '这是MVP内置的精品资讯周报演示版。正式运行后，系统会从一周资讯中筛选真正重要、值得深读的内容。',
   '[{"title":"知识库与资讯产品开始融合","summary":"真正有价值的AI资讯产品，不只告诉用户发生了什么，还要沉淀为可搜索、可追溯、可复用的内容资产。","article_slug":"rag-vs-long-context"},{"title":"Agent落地关键在流程而非概念","summary":"本周值得持续关注的不是Agent标签本身，而是任务拆解、工具权限、失败重试和人工确认等工程机制。","article_slug":"agent-workflow"},{"title":"研究工作流是高价值垂直场景","summary":"访谈、编码和报告生产具有材料复杂、过程可拆分、结果需核验等特点，适合形成专业AI工作流。","article_slug":"ai-research-workflow"}]',
   datetime('now','-7 days'), datetime('now'), 'published', CURRENT_TIMESTAMP);
