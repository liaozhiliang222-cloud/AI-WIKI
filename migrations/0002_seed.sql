INSERT OR IGNORE INTO categories (id, slug, name, description, sort_order) VALUES
  (1, 'basics', '基础概念', '用通俗语言理解模型、Token、上下文与推理。', 1),
  (2, 'products', '模型与产品', '追踪主流模型、工具与产品能力变化。', 2),
  (3, 'practice', '应用实践', '从提示词到可复用工作流的实操指南。', 3),
  (4, 'research', '研究与咨询', '访谈、编码、洞察与报告生产的AI方法。', 4),
  (5, 'governance', '治理与安全', '关注隐私、版权、政策、安全和负责任使用。', 5);

INSERT OR IGNORE INTO sources (id, name, feed_url, site_url, source_type, trust_level, active) VALUES
  (1, 'AI Compass 编辑部', 'https://example.com/ai-compass-editorial.xml', 'https://example.com', 'editorial', 5, 0),
  (2, 'OpenAI News', 'https://openai.com/news/rss.xml', 'https://openai.com/news/', 'rss', 5, 1),
  (3, 'Cloudflare Blog', 'https://blog.cloudflare.com/rss/', 'https://blog.cloudflare.com/', 'rss', 5, 1),
  (4, 'Google AI Blog', 'https://blog.google/rss/', 'https://blog.google/innovation-and-ai/technology/ai/', 'rss', 5, 1);

INSERT OR IGNORE INTO articles
  (id, source_id, category_id, slug, title, summary, why_it_matters, content, source_name, source_url, tags_json, confidence, reading_minutes, published_at, status, created_at, updated_at)
VALUES
  (1, 1, 1, 'what-is-context-window', '什么是上下文窗口？它为什么影响AI回答质量',
   '上下文窗口决定模型一次能够读取和处理多少信息，但窗口更长并不自动等于理解更准确。',
   '选择模型和设计工作流时，需要同时考虑长度、检索方式、信息密度和成本。',
   '上下文窗口可以理解为模型一次对话中能够看到的工作记忆。它通常以 Token 计算，包含用户问题、历史消息、系统指令以及模型生成内容。\n\n更长的上下文适合处理长文档和多轮任务，但仍可能出现信息遗漏、注意力分散与成本上升。实际产品通常会把全文检索、摘要、分段处理和长上下文结合起来。',
   'AI Compass 编辑部', 'https://example.com', '["大模型","上下文","Token"]', 'high', 4, datetime('now','-2 days'), 'published', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, 1, 1, 'rag-vs-long-context', 'RAG与直接塞入长文本，有什么本质区别？',
   'RAG先检索相关片段再交给模型，长上下文则把更多材料一次性提供给模型，两者适合不同任务。',
   '知识库问答通常更适合以检索为主、长上下文为辅，兼顾可追溯性与成本。',
   'RAG的核心是先从知识库中找到与问题最相关的内容，再让模型基于这些内容回答。它有利于展示来源、更新知识和控制成本。\n\n长上下文更适合材料规模可控、文档之间关系复杂、需要全局理解的任务。成熟系统不会把二者视为二选一，而是根据问题动态选择。',
   'AI Compass 编辑部', 'https://example.com', '["RAG","知识库","检索"]', 'high', 5, datetime('now','-1 day'), 'published', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (3, 1, 2, 'agent-workflow', 'AI Agent不是聊天机器人：从任务拆解到工具调用',
   'Agent的价值在于围绕目标规划步骤、调用工具、读取结果并持续修正，而不仅是生成一段文字。',
   '理解Agent边界，有助于判断一个产品是真自动化，还是只在普通对话框外套了一层包装。',
   '一个典型Agent通常包含目标、状态、工具、循环和停止条件。模型负责判断下一步，外部程序负责真正执行搜索、数据库查询或文件处理。\n\nAgent的主要风险来自错误累积、权限过大、成本失控和缺少确认节点，因此需要日志、预算、重试和人工审核机制。',
   'AI Compass 编辑部', 'https://example.com', '["Agent","自动化","工具调用"]', 'high', 6, datetime('now','-1 day'), 'published', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (4, 1, 4, 'ai-research-workflow', '研究人员如何把AI嵌入访谈、编码与报告流程',
   '最稳妥的方法不是让AI一次生成整份报告，而是把资料清洗、编码、证据关联和洞察表达拆成可核验环节。',
   '分阶段工作流能减少幻觉，并保留从结论回到原始证据的路径。',
   '研究型AI工作流可以拆分为：材料整理、说话人校正、开放编码、主题聚类、反例检查、洞察提炼和报告表达。\n\n每一步都应输出结构化中间结果，并保留对应原话、样本编号和置信度。AI适合提高效率，研究者仍负责定义问题、判断证据与形成最终观点。',
   'AI Compass 编辑部', 'https://example.com', '["定性研究","访谈","洞察"]', 'high', 7, datetime('now'), 'published', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO briefs (id, title, intro, highlights_json, period_start, period_end, status, published_at)
VALUES (1, '今日AI资讯日报 · 产品初始化演示版',
  '这是MVP内置的资讯日报演示版。启用资讯源后，系统会每天汇总过去24小时的重要AI动态。',
  '[{"title":"从新闻流升级为知识更新","summary":"新资讯不只生成摘要，还会被分类、关联到知识节点，并保留来源。","article_slug":"rag-vs-long-context"},{"title":"抓取与处理分离","summary":"Cron负责发现更新，Queue负责抓取、清洗、摘要和入库，失败任务可以重试。","article_slug":"agent-workflow"},{"title":"优先服务研究与知识工作者","summary":"首批内容可以围绕访谈分析、研究报告与办公工作流建立差异化。","article_slug":"ai-research-workflow"}]',
  datetime('now','-1 day'), datetime('now'), 'published', CURRENT_TIMESTAMP);
