-- AI-WIKI 首批长期知识内容：新增58篇，与已有4篇合计62篇。
-- 本迁移只新增 content_type='knowledge' 的编辑型内容，不影响资讯抓取、日报和周报。

INSERT OR IGNORE INTO articles
  (source_id, category_id, slug, title, summary, why_it_matters, content, source_name, source_url, tags_json, confidence, reading_minutes, published_at, status, content_type, created_at, updated_at)
VALUES
  (1, (SELECT id FROM categories WHERE slug = 'basics'), 'what-is-token', 'Token是什么？为什么字数不等于Token数',
   'Token是模型处理文本的基本单位，可能是一个字、词的一部分或标点，不同模型的切分方式并不完全相同。',
   'Token直接影响上下文容量、调用成本和输出长度，是理解大模型使用限制的第一步。',
   '模型并不是逐字阅读文本，而是先把内容切分成Token再进行计算。中文通常一个汉字可能接近一个Token，但数字、英文和特殊符号的切分会更复杂。

设计提示词和知识库时，不应只看字符数。更稳妥的做法是控制信息密度、删除重复内容，并为长文档预留模型输出所需的Token空间。',
   'AI Compass 编辑部', 'https://aiwiki.liaozhiliang222.workers.dev', '["Token","大模型基础","成本"]', 'high', 4, datetime('now','-406 minutes'), 'published', 'knowledge', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO articles
  (source_id, category_id, slug, title, summary, why_it_matters, content, source_name, source_url, tags_json, confidence, reading_minutes, published_at, status, content_type, created_at, updated_at)
VALUES
  (1, (SELECT id FROM categories WHERE slug = 'basics'), 'what-is-llm', '什么是大语言模型？它究竟在做什么',
   '大语言模型通过学习海量文本中的统计规律，根据已有上下文预测接下来最可能出现的Token。',
   '理解其预测本质，有助于正确看待模型能力、幻觉和不确定性。',
   '大语言模型并不是传统意义上的知识数据库。训练让模型形成了语言、概念和任务模式的内部表示，再通过逐步预测生成回答。

它可以表现出总结、推理、翻译和规划能力，但输出仍可能受到训练数据、提示方式和采样随机性的影响，因此重要结论需要外部证据校验。',
   'AI Compass 编辑部', 'https://aiwiki.liaozhiliang222.workers.dev', '["大语言模型","生成式AI","基础概念"]', 'high', 5, datetime('now','-399 minutes'), 'published', 'knowledge', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO articles
  (source_id, category_id, slug, title, summary, why_it_matters, content, source_name, source_url, tags_json, confidence, reading_minutes, published_at, status, content_type, created_at, updated_at)
VALUES
  (1, (SELECT id FROM categories WHERE slug = 'basics'), 'training-inference-finetuning', '训练、推理与微调有什么区别',
   '训练用于学习通用能力，推理是模型实际回答问题的过程，微调则用特定数据进一步调整模型行为。',
   '区分三者可以避免把“使用模型”和“重新训练模型”混为一谈。',
   '预训练通常消耗大量算力，让模型学习广泛的语言与知识模式。推理发生在用户每次发送请求时，成本通常与输入输出Token有关。

微调适合稳定改变输出风格、格式或专业行为，但它不能替代及时知识检索。需要最新资料时，通常应优先考虑RAG或工具调用。',
   'AI Compass 编辑部', 'https://aiwiki.liaozhiliang222.workers.dev', '["训练","推理","微调"]', 'high', 5, datetime('now','-392 minutes'), 'published', 'knowledge', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO articles
  (source_id, category_id, slug, title, summary, why_it_matters, content, source_name, source_url, tags_json, confidence, reading_minutes, published_at, status, content_type, created_at, updated_at)
VALUES
  (1, (SELECT id FROM categories WHERE slug = 'basics'), 'temperature-top-p', 'Temperature与Top-p如何影响输出',
   'Temperature和Top-p控制模型生成时的随机性与候选范围，数值越开放，结果通常越多样。',
   '合理设置采样参数可以在稳定性和创造性之间取得平衡。',
   '低Temperature更适合事实提取、分类和固定格式输出；较高Temperature更适合头脑风暴、文案创意和多方案探索。

Top-p限制模型从累计概率最高的一组候选中采样。多数业务场景不需要同时大幅调整两者，先降低Temperature通常更容易获得稳定结果。',
   'AI Compass 编辑部', 'https://aiwiki.liaozhiliang222.workers.dev', '["Temperature","Top-p","采样参数"]', 'high', 4, datetime('now','-385 minutes'), 'published', 'knowledge', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO articles
  (source_id, category_id, slug, title, summary, why_it_matters, content, source_name, source_url, tags_json, confidence, reading_minutes, published_at, status, content_type, created_at, updated_at)
VALUES
  (1, (SELECT id FROM categories WHERE slug = 'basics'), 'what-is-embedding', '什么是Embedding？为什么它能做语义搜索',
   'Embedding把文本、图片或其他内容映射为一组向量，使语义相近的内容在向量空间中更接近。',
   '它是语义搜索、推荐、聚类和RAG检索的重要基础。',
   '关键词搜索依赖字面匹配，而Embedding可以识别不同表达之间的语义关联，例如“退款体验”和“售后退费”可能被判断为相近。

实际系统通常把向量检索与关键词检索结合使用，再通过重排序提升结果质量。Embedding模型也需要根据语言、领域和数据规模选择。',
   'AI Compass 编辑部', 'https://aiwiki.liaozhiliang222.workers.dev', '["Embedding","向量检索","语义搜索"]', 'high', 5, datetime('now','-378 minutes'), 'published', 'knowledge', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO articles
  (source_id, category_id, slug, title, summary, why_it_matters, content, source_name, source_url, tags_json, confidence, reading_minutes, published_at, status, content_type, created_at, updated_at)
VALUES
  (1, (SELECT id FROM categories WHERE slug = 'basics'), 'hallucination-explained', 'AI幻觉是什么？为什么模型会自信地说错',
   '幻觉是模型生成了看似合理但缺乏事实依据、来源错误或与材料矛盾的内容。',
   '了解幻觉成因，才能为高风险任务设计引用、校验和人工审核机制。',
   '模型的目标是生成连贯输出，而不是天然保证每句话都真实。当问题信息不足、要求过细、知识过时或材料相互冲突时，幻觉风险会上升。

降低幻觉的方法包括限定资料范围、要求逐条引用、允许回答“不知道”、使用结构化输出，以及对关键数字和结论进行程序化校验。',
   'AI Compass 编辑部', 'https://aiwiki.liaozhiliang222.workers.dev', '["幻觉","事实核验","可靠性"]', 'high', 5, datetime('now','-371 minutes'), 'published', 'knowledge', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO articles
  (source_id, category_id, slug, title, summary, why_it_matters, content, source_name, source_url, tags_json, confidence, reading_minutes, published_at, status, content_type, created_at, updated_at)
VALUES
  (1, (SELECT id FROM categories WHERE slug = 'basics'), 'zero-one-few-shot', '零样本、单样本与少样本提示有什么区别',
   '零样本只给任务说明，单样本提供一个示例，少样本则用多个示例帮助模型理解规则。',
   '在分类、格式化和风格一致性任务中，优质示例往往比冗长说明更有效。',
   '当任务标准容易理解时，零样本提示即可完成。若输出格式特殊或边界模糊，加入一到三个代表性示例通常能明显提升稳定性。

示例应覆盖典型情况和容易混淆的边界，但不要堆积太多相似样本，否则会浪费上下文并可能让模型过度模仿。',
   'AI Compass 编辑部', 'https://aiwiki.liaozhiliang222.workers.dev', '["提示词","Few-shot","示例学习"]', 'high', 4, datetime('now','-364 minutes'), 'published', 'knowledge', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO articles
  (source_id, category_id, slug, title, summary, why_it_matters, content, source_name, source_url, tags_json, confidence, reading_minutes, published_at, status, content_type, created_at, updated_at)
VALUES
  (1, (SELECT id FROM categories WHERE slug = 'basics'), 'structured-output', '为什么要让AI输出结构化JSON',
   '结构化输出把模型结果约束为字段明确的数据，便于程序校验、入库和后续自动处理。',
   '从聊天演示走向可用产品，结构化输出往往是最关键的一步。',
   '自然语言回答适合人阅读，但难以稳定接入数据库和自动流程。JSON可以明确标题、摘要、标签、置信度等字段，并对缺失值做检查。

实际使用时应提供字段定义、允许值和失败处理，并在程序端再次解析和验证，不能只依赖模型“承诺”输出正确格式。',
   'AI Compass 编辑部', 'https://aiwiki.liaozhiliang222.workers.dev', '["JSON","结构化输出","自动化"]', 'high', 5, datetime('now','-357 minutes'), 'published', 'knowledge', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO articles
  (source_id, category_id, slug, title, summary, why_it_matters, content, source_name, source_url, tags_json, confidence, reading_minutes, published_at, status, content_type, created_at, updated_at)
VALUES
  (1, (SELECT id FROM categories WHERE slug = 'basics'), 'multimodal-model', '什么是多模态模型',
   '多模态模型能够共同处理文本、图片、音频、视频或其他数据，并在不同信息形式之间建立关联。',
   '它让AI从文字助手扩展到文档理解、视觉分析和语音交互。',
   '多模态并不意味着模型对所有模态都同样准确。图片中的小字、复杂表格、长音频和快速视频仍可能造成遗漏。

设计应用时应根据任务拆分模态处理，例如先进行版面分析、语音分段或关键帧提取，再交给模型综合判断。',
   'AI Compass 编辑部', 'https://aiwiki.liaozhiliang222.workers.dev', '["多模态","视觉理解","语音"]', 'high', 5, datetime('now','-350 minutes'), 'published', 'knowledge', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO articles
  (source_id, category_id, slug, title, summary, why_it_matters, content, source_name, source_url, tags_json, confidence, reading_minutes, published_at, status, content_type, created_at, updated_at)
VALUES
  (1, (SELECT id FROM categories WHERE slug = 'basics'), 'reasoning-models', '推理模型与普通对话模型有何不同',
   '推理模型通常会投入更多计算步骤处理复杂问题，适合数学、代码、规划和多约束分析。',
   '不是所有任务都需要推理模型，合理分流可以同时提升质量和控制成本。',
   '复杂推理任务需要模型在回答前进行更多中间计算，因此延迟和费用通常更高。简单改写、分类和摘要使用轻量模型往往已经足够。

成熟系统会按任务难度路由模型：低成本模型处理高频简单请求，较强推理模型只处理少量关键任务。',
   'AI Compass 编辑部', 'https://aiwiki.liaozhiliang222.workers.dev', '["推理模型","模型路由","成本控制"]', 'high', 5, datetime('now','-343 minutes'), 'published', 'knowledge', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO articles
  (source_id, category_id, slug, title, summary, why_it_matters, content, source_name, source_url, tags_json, confidence, reading_minutes, published_at, status, content_type, created_at, updated_at)
VALUES
  (1, (SELECT id FROM categories WHERE slug = 'products'), 'model-selection-framework', '如何选择适合业务的AI模型',
   '模型选择应综合考虑质量、速度、价格、上下文、模态能力、隐私和服务稳定性。',
   '只比较排行榜分数，很容易选到不适合真实工作流的模型。',
   '先定义任务和验收标准，再用真实样本进行小规模测试。需要比较的不只是正确率，还包括失败模式、响应时间、格式遵循和中文表现。

对于生产系统，通常还需要准备备用模型和降级策略，避免单一供应商故障导致业务中断。',
   'AI Compass 编辑部', 'https://aiwiki.liaozhiliang222.workers.dev', '["模型选择","评测","供应商"]', 'high', 6, datetime('now','-336 minutes'), 'published', 'knowledge', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO articles
  (source_id, category_id, slug, title, summary, why_it_matters, content, source_name, source_url, tags_json, confidence, reading_minutes, published_at, status, content_type, created_at, updated_at)
VALUES
  (1, (SELECT id FROM categories WHERE slug = 'products'), 'open-vs-closed-models', '开源模型与闭源模型怎么选',
   '开源模型提供更高的部署和定制自由度，闭源模型通常在易用性、能力和托管服务上更成熟。',
   '选择取决于隐私、团队能力、预算和业务规模，而不是简单判断谁更先进。',
   '闭源API适合快速上线和弹性扩容，团队不需要维护推理基础设施。开源模型适合本地部署、深度定制和成本可控的稳定大批量任务。

但本地部署还需要考虑显存、并发、升级、安全和运维，模型免费并不等于总成本更低。',
   'AI Compass 编辑部', 'https://aiwiki.liaozhiliang222.workers.dev', '["开源模型","闭源模型","部署"]', 'high', 6, datetime('now','-329 minutes'), 'published', 'knowledge', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO articles
  (source_id, category_id, slug, title, summary, why_it_matters, content, source_name, source_url, tags_json, confidence, reading_minutes, published_at, status, content_type, created_at, updated_at)
VALUES
  (1, (SELECT id FROM categories WHERE slug = 'products'), 'ai-search-vs-chat', 'AI搜索与普通聊天助手有什么区别',
   'AI搜索强调实时检索、来源引用和网页聚合，聊天助手更侧重多轮交流与内容生成。',
   '需要最新事实和可追溯证据时，应优先使用搜索型能力。',
   '普通聊天模型可能主要依赖训练知识，无法保证信息最新。AI搜索会先获取网页或数据库资料，再组织答案并附带来源。

高质量搜索产品还需要查询改写、结果排序、重复合并和来源可信度判断，而不仅是把搜索结果交给模型总结。',
   'AI Compass 编辑部', 'https://aiwiki.liaozhiliang222.workers.dev', '["AI搜索","聊天助手","实时信息"]', 'high', 5, datetime('now','-322 minutes'), 'published', 'knowledge', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO articles
  (source_id, category_id, slug, title, summary, why_it_matters, content, source_name, source_url, tags_json, confidence, reading_minutes, published_at, status, content_type, created_at, updated_at)
VALUES
  (1, (SELECT id FROM categories WHERE slug = 'products'), 'copilot-vs-agent', 'Copilot与Agent的产品边界',
   'Copilot通常辅助用户完成局部任务，Agent则尝试独立规划并执行更长链路的工作。',
   '明确两者边界，有助于设定正确的自动化程度和责任机制。',
   'Copilot以人为主导，用户决定下一步并确认结果；Agent以目标为导向，能够调用工具和循环执行。

高风险业务更适合从Copilot起步，在关键节点保留人工确认，再逐步把成熟、可验证的步骤交给Agent自动执行。',
   'AI Compass 编辑部', 'https://aiwiki.liaozhiliang222.workers.dev', '["Copilot","Agent","自动化边界"]', 'high', 5, datetime('now','-315 minutes'), 'published', 'knowledge', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO articles
  (source_id, category_id, slug, title, summary, why_it_matters, content, source_name, source_url, tags_json, confidence, reading_minutes, published_at, status, content_type, created_at, updated_at)
VALUES
  (1, (SELECT id FROM categories WHERE slug = 'products'), 'local-ai-deployment', '什么情况下值得本地部署AI模型',
   '当数据敏感、离线使用、调用量稳定且团队具备运维能力时，本地部署可能更合适。',
   '本地部署是一项系统工程，不应只根据单次API价格做决定。',
   '本地部署可以减少数据外传并获得更强控制，但需要承担硬件、模型优化、监控、安全补丁和容量规划。

对于早期产品，API通常更快验证需求；当调用量和隐私要求达到明确阈值后，再评估混合部署或本地部署更稳妥。',
   'AI Compass 编辑部', 'https://aiwiki.liaozhiliang222.workers.dev', '["本地部署","隐私","算力"]', 'high', 6, datetime('now','-308 minutes'), 'published', 'knowledge', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO articles
  (source_id, category_id, slug, title, summary, why_it_matters, content, source_name, source_url, tags_json, confidence, reading_minutes, published_at, status, content_type, created_at, updated_at)
VALUES
  (1, (SELECT id FROM categories WHERE slug = 'products'), 'ai-api-cost-model', 'AI API成本是怎么构成的',
   '主要成本来自输入Token、输出Token、图片或音频处理、向量化、缓存和工具调用。',
   '理解成本结构才能通过缓存、模型分层和上下文压缩控制预算。',
   '长提示词和长输出会直接增加费用。重复系统提示、整篇文档反复传输和无效重试，往往是隐藏成本来源。

可采用提示缓存、摘要记忆、检索裁剪、批处理和轻重模型分层，同时记录每个功能和用户的调用量。',
   'AI Compass 编辑部', 'https://aiwiki.liaozhiliang222.workers.dev', '["API成本","Token","预算"]', 'high', 5, datetime('now','-301 minutes'), 'published', 'knowledge', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO articles
  (source_id, category_id, slug, title, summary, why_it_matters, content, source_name, source_url, tags_json, confidence, reading_minutes, published_at, status, content_type, created_at, updated_at)
VALUES
  (1, (SELECT id FROM categories WHERE slug = 'products'), 'model-benchmark-limits', '为什么模型排行榜不能代替真实评测',
   '公开基准只覆盖有限任务，可能存在数据污染、提示差异和与业务场景不一致的问题。',
   '真实业务样本和失败案例比单一排行榜名次更能指导选型。',
   '模型在数学或代码基准上的高分，不代表它在中文访谈、企业术语或固定格式输出中同样优秀。

内部评测集应包含常见任务、边界样本和高风险错误，并定期复测模型升级后的表现。',
   'AI Compass 编辑部', 'https://aiwiki.liaozhiliang222.workers.dev', '["Benchmark","模型评测","业务测试"]', 'high', 5, datetime('now','-294 minutes'), 'published', 'knowledge', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO articles
  (source_id, category_id, slug, title, summary, why_it_matters, content, source_name, source_url, tags_json, confidence, reading_minutes, published_at, status, content_type, created_at, updated_at)
VALUES
  (1, (SELECT id FROM categories WHERE slug = 'products'), 'ai-gateway-value', '为什么需要AI Gateway',
   'AI Gateway统一代理多个模型服务，提供日志、限流、缓存、重试和供应商切换。',
   '当产品从试验进入运营阶段，网关可以显著降低成本和故障风险。',
   '直接在各功能中调用不同模型API，容易造成密钥分散、费用不可见和切换困难。网关把调用集中管理，可以记录延迟、Token和错误率。

还可以根据任务自动路由到不同模型，在主服务不可用时切换备用供应商。',
   'AI Compass 编辑部', 'https://aiwiki.liaozhiliang222.workers.dev', '["AI Gateway","模型路由","可观测性"]', 'high', 5, datetime('now','-287 minutes'), 'published', 'knowledge', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO articles
  (source_id, category_id, slug, title, summary, why_it_matters, content, source_name, source_url, tags_json, confidence, reading_minutes, published_at, status, content_type, created_at, updated_at)
VALUES
  (1, (SELECT id FROM categories WHERE slug = 'products'), 'vector-database-basics', '向量数据库一定是知识库必需品吗',
   '向量数据库适合语义检索，但小型知识库可以先用全文搜索，或采用混合检索。',
   '避免过早引入复杂基础设施，可以更快验证内容和搜索需求。',
   '当数据量不大、关键词明确时，传统全文搜索可能已经够用。向量检索在同义表达、模糊问题和跨语言检索方面更有优势。

很多成熟系统采用关键词与向量混合检索，再通过重排序模型选出最终上下文。',
   'AI Compass 编辑部', 'https://aiwiki.liaozhiliang222.workers.dev', '["向量数据库","全文搜索","混合检索"]', 'high', 5, datetime('now','-280 minutes'), 'published', 'knowledge', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO articles
  (source_id, category_id, slug, title, summary, why_it_matters, content, source_name, source_url, tags_json, confidence, reading_minutes, published_at, status, content_type, created_at, updated_at)
VALUES
  (1, (SELECT id FROM categories WHERE slug = 'practice'), 'prompt-four-elements', '高质量提示词的四个基本要素',
   '清晰提示通常包括任务目标、输入材料、执行规则和输出格式。',
   '掌握统一模板后，可以减少反复沟通并提升结果稳定性。',
   '先说明要解决什么问题，再提供必要背景和材料；随后列出限制、判断标准和禁止事项，最后规定输出结构。

提示词并非越长越好。无关背景、互相冲突的规则和模糊形容词都会降低效果。',
   'AI Compass 编辑部', 'https://aiwiki.liaozhiliang222.workers.dev', '["提示词","任务设计","输出格式"]', 'high', 5, datetime('now','-273 minutes'), 'published', 'knowledge', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO articles
  (source_id, category_id, slug, title, summary, why_it_matters, content, source_name, source_url, tags_json, confidence, reading_minutes, published_at, status, content_type, created_at, updated_at)
VALUES
  (1, (SELECT id FROM categories WHERE slug = 'practice'), 'prompt-debugging', 'AI回答不好时，如何系统调试提示词',
   '先定位问题属于材料不足、任务模糊、示例不当、模型能力不足还是输出校验缺失。',
   '逐项排查比不断追加“请认真思考”更有效。',
   '保留失败输入和输出，明确期望差异，再一次只修改一个变量。可以依次检查：是否给足资料、是否定义标准、是否提供示例、是否需要拆分步骤。

若问题仍然存在，应考虑更换模型、增加检索或在程序端加入规则，而不是把所有责任都交给提示词。',
   'AI Compass 编辑部', 'https://aiwiki.liaozhiliang222.workers.dev', '["提示词调试","质量控制","迭代"]', 'high', 5, datetime('now','-266 minutes'), 'published', 'knowledge', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO articles
  (source_id, category_id, slug, title, summary, why_it_matters, content, source_name, source_url, tags_json, confidence, reading_minutes, published_at, status, content_type, created_at, updated_at)
VALUES
  (1, (SELECT id FROM categories WHERE slug = 'practice'), 'document-summary-workflow', '长文档摘要的可靠工作流',
   '先分段提取事实，再生成章节摘要，最后进行跨章节综合，比一次塞入全文更可靠。',
   '分层摘要可以减少遗漏并保留结论到原文的映射。',
   '对长文档先识别结构和章节，再为每段提取主题、关键事实、数字和原文位置。之后合并重复信息并生成总摘要。

最终摘要应保留引用或页码，对无法确认的内容明确标记，而不是让模型补全。',
   'AI Compass 编辑部', 'https://aiwiki.liaozhiliang222.workers.dev', '["长文档","摘要","分段处理"]', 'high', 6, datetime('now','-259 minutes'), 'published', 'knowledge', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO articles
  (source_id, category_id, slug, title, summary, why_it_matters, content, source_name, source_url, tags_json, confidence, reading_minutes, published_at, status, content_type, created_at, updated_at)
VALUES
  (1, (SELECT id FROM categories WHERE slug = 'practice'), 'meeting-notes-workflow', '如何用AI整理会议纪要而不丢失责任信息',
   '会议纪要应分别提取讨论结论、待办事项、负责人、截止时间和未决问题。',
   '结构化纪要能减少会后理解偏差，并方便后续追踪。',
   '先对转写文本进行说话人和时间校正，再按议题分段。让AI提取明确承诺，但不要根据语气推测负责人或日期。

输出后应由参会者确认关键决策，尤其是涉及预算、范围和责任分配的内容。',
   'AI Compass 编辑部', 'https://aiwiki.liaozhiliang222.workers.dev', '["会议纪要","待办事项","协作"]', 'high', 5, datetime('now','-252 minutes'), 'published', 'knowledge', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO articles
  (source_id, category_id, slug, title, summary, why_it_matters, content, source_name, source_url, tags_json, confidence, reading_minutes, published_at, status, content_type, created_at, updated_at)
VALUES
  (1, (SELECT id FROM categories WHERE slug = 'practice'), 'email-assistant-safety', '用AI写邮件时要注意什么',
   'AI可以帮助组织语气和结构，但收件人、事实、附件和承诺必须由发送者确认。',
   '邮件属于对外沟通，细小错误也可能造成实际责任。',
   '使用AI前先给出目的、关系、语气和必须包含的信息。生成后检查姓名、日期、数字、附件和行动承诺。

涉及客户、法律或敏感数据时，应避免把完整隐私信息发送给未经批准的模型服务。',
   'AI Compass 编辑部', 'https://aiwiki.liaozhiliang222.workers.dev', '["邮件","沟通","隐私"]', 'high', 4, datetime('now','-245 minutes'), 'published', 'knowledge', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO articles
  (source_id, category_id, slug, title, summary, why_it_matters, content, source_name, source_url, tags_json, confidence, reading_minutes, published_at, status, content_type, created_at, updated_at)
VALUES
  (1, (SELECT id FROM categories WHERE slug = 'practice'), 'spreadsheet-ai-workflow', 'AI如何辅助表格分析',
   'AI适合解释字段、生成公式、发现异常和形成分析思路，但计算结果应由表格或代码执行。',
   '把语言推理和确定性计算分开，可以避免数字幻觉。',
   '先让AI理解数据字典和分析目标，再生成可执行的SQL、Python或表格公式。实际计算由工具完成，模型负责解释结果和提出后续问题。

对于关键指标，应记录筛选条件、分母定义和缺失值处理规则。',
   'AI Compass 编辑部', 'https://aiwiki.liaozhiliang222.workers.dev', '["表格分析","数据分析","公式"]', 'high', 6, datetime('now','-238 minutes'), 'published', 'knowledge', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO articles
  (source_id, category_id, slug, title, summary, why_it_matters, content, source_name, source_url, tags_json, confidence, reading_minutes, published_at, status, content_type, created_at, updated_at)
VALUES
  (1, (SELECT id FROM categories WHERE slug = 'practice'), 'ai-presentation-workflow', '用AI生成PPT的正确流程',
   '先确定故事线和证据，再设计页面结构与图表，最后生成可编辑的视觉元素。',
   '直接让AI一次生成整套PPT，往往会得到内容空泛或难以编辑的结果。',
   '可靠流程通常分为：梳理受众与目标、提炼核心结论、建立页面目录、匹配数据证据、选择图表和完成视觉排版。

文字、图表和图标应尽量保持可编辑，图片生成适合封面和氛围视觉，不应替代关键数据表达。',
   'AI Compass 编辑部', 'https://aiwiki.liaozhiliang222.workers.dev', '["PPT","可视化","报告"]', 'high', 6, datetime('now','-231 minutes'), 'published', 'knowledge', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO articles
  (source_id, category_id, slug, title, summary, why_it_matters, content, source_name, source_url, tags_json, confidence, reading_minutes, published_at, status, content_type, created_at, updated_at)
VALUES
  (1, (SELECT id FROM categories WHERE slug = 'practice'), 'ai-coding-review', '让AI写代码后必须检查什么',
   '需要检查依赖版本、错误处理、安全边界、测试覆盖和部署环境，而不只是代码能否运行。',
   'AI生成代码可能看似完整，却隐藏过时API和安全问题。',
   '先要求模型说明假设和依赖，再生成最小可运行版本。通过类型检查、单元测试、静态分析和真实构建验证。

密钥、权限、输入校验和数据库操作需要重点人工审查，不能直接把生成代码部署到生产环境。',
   'AI Compass 编辑部', 'https://aiwiki.liaozhiliang222.workers.dev', '["AI编程","代码审查","测试"]', 'high', 6, datetime('now','-224 minutes'), 'published', 'knowledge', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO articles
  (source_id, category_id, slug, title, summary, why_it_matters, content, source_name, source_url, tags_json, confidence, reading_minutes, published_at, status, content_type, created_at, updated_at)
VALUES
  (1, (SELECT id FROM categories WHERE slug = 'practice'), 'human-in-the-loop', '什么是Human-in-the-loop',
   'Human-in-the-loop是在关键节点加入人工判断、确认或纠错，而不是让AI全自动运行。',
   '它是高风险AI工作流控制质量与责任的重要机制。',
   '人工不需要审核每一步，而应集中在高影响、低置信度或不可逆操作上。例如对外发布、付款、删除数据和最终研究结论。

系统应向审核者展示原始证据、AI建议、置信度和修改入口，避免只提供一个“同意”按钮。',
   'AI Compass 编辑部', 'https://aiwiki.liaozhiliang222.workers.dev', '["人工审核","工作流","风险控制"]', 'high', 5, datetime('now','-217 minutes'), 'published', 'knowledge', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO articles
  (source_id, category_id, slug, title, summary, why_it_matters, content, source_name, source_url, tags_json, confidence, reading_minutes, published_at, status, content_type, created_at, updated_at)
VALUES
  (1, (SELECT id FROM categories WHERE slug = 'practice'), 'ai-output-evaluation', '如何建立AI输出验收标准',
   '将“好不好”拆成准确性、完整性、格式、可追溯性、语气和安全等可观察维度。',
   '明确标准才能稳定比较提示词、模型和版本变化。',
   '为每类任务设计评分表和代表性样本，先由人工建立基准答案，再测量模型表现。

除了平均分，还要单独关注严重错误率和最差案例，因为少量高风险失败可能比整体提升更重要。',
   'AI Compass 编辑部', 'https://aiwiki.liaozhiliang222.workers.dev', '["评测","验收标准","质量"]', 'high', 5, datetime('now','-210 minutes'), 'published', 'knowledge', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO articles
  (source_id, category_id, slug, title, summary, why_it_matters, content, source_name, source_url, tags_json, confidence, reading_minutes, published_at, status, content_type, created_at, updated_at)
VALUES
  (1, (SELECT id FROM categories WHERE slug = 'practice'), 'knowledge-base-content-design', 'AI知识库内容应该怎样组织',
   '知识库应围绕用户问题建立主题、层级、标签、版本和来源，而不是简单堆放文件。',
   '良好结构决定搜索、学习路径和AI问答的质量上限。',
   '每个知识节点应回答一个清晰问题，并包含摘要、详细解释、相关概念、来源和更新时间。

动态资讯与长期知识应分开管理：资讯记录发生了什么，知识节点解释它意味着什么以及如何应用。',
   'AI Compass 编辑部', 'https://aiwiki.liaozhiliang222.workers.dev', '["知识库","信息架构","内容设计"]', 'high', 6, datetime('now','-203 minutes'), 'published', 'knowledge', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO articles
  (source_id, category_id, slug, title, summary, why_it_matters, content, source_name, source_url, tags_json, confidence, reading_minutes, published_at, status, content_type, created_at, updated_at)
VALUES
  (1, (SELECT id FROM categories WHERE slug = 'practice'), 'hybrid-search-rerank', '混合检索与重排序如何提升RAG',
   '混合检索同时使用关键词和向量召回，重排序再根据问题挑选最相关片段。',
   '它能减少只靠单一检索方式造成的漏检和误检。',
   '关键词检索擅长专有名词、数字和精确表达，向量检索擅长语义相近的不同说法。先扩大召回，再用重排序模型评估问题与片段的真实相关性。

最终还应控制片段重复、来源多样性和上下文总长度。',
   'AI Compass 编辑部', 'https://aiwiki.liaozhiliang222.workers.dev', '["混合检索","重排序","RAG"]', 'high', 6, datetime('now','-196 minutes'), 'published', 'knowledge', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO articles
  (source_id, category_id, slug, title, summary, why_it_matters, content, source_name, source_url, tags_json, confidence, reading_minutes, published_at, status, content_type, created_at, updated_at)
VALUES
  (1, (SELECT id FROM categories WHERE slug = 'practice'), 'context-compression', '什么是上下文压缩',
   '上下文压缩是在送入模型前删除无关、重复或低价值信息，只保留解决问题所需证据。',
   '它可以降低成本、提高信息密度并减少模型注意力分散。',
   '压缩不等于简单摘要。对数字、条款和引用，应保留原文；对背景和重复解释，可以转为短摘要。

常见方法包括查询相关片段筛选、章节摘要、重复去除和结构化字段提取。',
   'AI Compass 编辑部', 'https://aiwiki.liaozhiliang222.workers.dev', '["上下文压缩","成本优化","RAG"]', 'high', 5, datetime('now','-189 minutes'), 'published', 'knowledge', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO articles
  (source_id, category_id, slug, title, summary, why_it_matters, content, source_name, source_url, tags_json, confidence, reading_minutes, published_at, status, content_type, created_at, updated_at)
VALUES
  (1, (SELECT id FROM categories WHERE slug = 'practice'), 'ai-workflow-observability', 'AI工作流为什么需要日志和可观测性',
   '应记录输入、模型、提示版本、Token、延迟、工具调用、错误和最终结果。',
   '没有日志就难以定位质量下降、费用异常和供应商故障。',
   '生产系统中的AI输出会随模型版本、资料和提示变化。日志帮助团队复现问题并比较不同版本。

同时要避免记录不必要的敏感数据，并设置访问权限和保留期限。',
   'AI Compass 编辑部', 'https://aiwiki.liaozhiliang222.workers.dev', '["可观测性","日志","AI运维"]', 'high', 5, datetime('now','-182 minutes'), 'published', 'knowledge', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO articles
  (source_id, category_id, slug, title, summary, why_it_matters, content, source_name, source_url, tags_json, confidence, reading_minutes, published_at, status, content_type, created_at, updated_at)
VALUES
  (1, (SELECT id FROM categories WHERE slug = 'practice'), 'fallback-strategy', 'AI功能的降级策略怎么设计',
   '当模型超时、额度不足或服务不可用时，系统应提供缓存结果、规则摘要或备用模型。',
   '降级可以让产品在外部AI服务波动时仍保持基本可用。',
   '先区分核心功能与增强功能。核心查询可以使用备用模型，非关键生成可以延迟处理或显示原始资料。

用户界面应明确告知结果处于降级状态，而不是静默返回低质量内容。',
   'AI Compass 编辑部', 'https://aiwiki.liaozhiliang222.workers.dev', '["降级策略","可靠性","备用模型"]', 'high', 5, datetime('now','-175 minutes'), 'published', 'knowledge', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO articles
  (source_id, category_id, slug, title, summary, why_it_matters, content, source_name, source_url, tags_json, confidence, reading_minutes, published_at, status, content_type, created_at, updated_at)
VALUES
  (1, (SELECT id FROM categories WHERE slug = 'practice'), 'prompt-versioning', '为什么提示词也需要版本管理',
   '提示词变化会影响输出质量和数据结构，应像代码一样记录版本、测试和回滚。',
   '版本管理能避免一次小修改破坏已稳定运行的工作流。',
   '每次修改应记录目的、差异和评测结果，并绑定到具体模型版本。对于关键流程，可以采用灰度发布或A/B测试。

数据库中保存提示版本，有助于追溯某条结果是由哪套规则生成。',
   'AI Compass 编辑部', 'https://aiwiki.liaozhiliang222.workers.dev', '["提示词版本","A/B测试","回滚"]', 'high', 5, datetime('now','-168 minutes'), 'published', 'knowledge', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO articles
  (source_id, category_id, slug, title, summary, why_it_matters, content, source_name, source_url, tags_json, confidence, reading_minutes, published_at, status, content_type, created_at, updated_at)
VALUES
  (1, (SELECT id FROM categories WHERE slug = 'practice'), 'automation-boundaries', '哪些任务不适合完全交给AI自动化',
   '目标模糊、后果重大、证据不足或需要价值判断的任务不适合直接全自动执行。',
   '自动化边界决定产品是否可靠，也影响法律和组织责任。',
   'AI适合处理高频、可重复、可验证的步骤。涉及人事、医疗、法律、财务承诺和不可逆操作时，应保留专业人员审核。

可以先让AI提供建议和证据，再由人做最终决定。',
   'AI Compass 编辑部', 'https://aiwiki.liaozhiliang222.workers.dev', '["自动化边界","高风险任务","责任"]', 'high', 5, datetime('now','-161 minutes'), 'published', 'knowledge', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO articles
  (source_id, category_id, slug, title, summary, why_it_matters, content, source_name, source_url, tags_json, confidence, reading_minutes, published_at, status, content_type, created_at, updated_at)
VALUES
  (1, (SELECT id FROM categories WHERE slug = 'research'), 'interview-guide-ai', '如何用AI辅助设计访谈提纲',
   'AI可以帮助展开研究问题、补充追问和检查提纲结构，但不能代替研究目标与样本理解。',
   '把AI作为提纲评审者，比让它从零生成通用问题更有价值。',
   '先提供研究背景、目标人群、已有假设和禁区，让AI检查问题是否引导、重复或缺少关键环节。

最终提纲要围绕真实决策需求，并为不同受访者准备灵活追问。',
   'AI Compass 编辑部', 'https://aiwiki.liaozhiliang222.workers.dev', '["访谈提纲","定性研究","追问"]', 'high', 6, datetime('now','-154 minutes'), 'published', 'knowledge', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO articles
  (source_id, category_id, slug, title, summary, why_it_matters, content, source_name, source_url, tags_json, confidence, reading_minutes, published_at, status, content_type, created_at, updated_at)
VALUES
  (1, (SELECT id FROM categories WHERE slug = 'research'), 'transcript-cleaning', '访谈笔录校正应遵循什么原则',
   '校正应保留原意，只修复明显识别错误、标点、说话人和专业词，不应美化或改写观点。',
   '笔录是研究证据，过度润色会改变受访者真实表达。',
   '建立术语表和说话人规则，优先校正影响理解的错误。对无法确认的词语保留标记，并可回听原音。

所有重要修改应可追溯，原始转写不能被覆盖删除。',
   'AI Compass 编辑部', 'https://aiwiki.liaozhiliang222.workers.dev', '["访谈笔录","ASR","证据"]', 'high', 6, datetime('now','-147 minutes'), 'published', 'knowledge', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO articles
  (source_id, category_id, slug, title, summary, why_it_matters, content, source_name, source_url, tags_json, confidence, reading_minutes, published_at, status, content_type, created_at, updated_at)
VALUES
  (1, (SELECT id FROM categories WHERE slug = 'research'), 'open-coding-ai', 'AI如何辅助开放编码',
   'AI可以逐段提出描述性代码、对应原话和理由，研究者负责合并、修订和解释。',
   '结构化编码能提高效率，但代码体系仍需由研究问题和材料共同形成。',
   '开放编码阶段应尽量贴近受访者表达，避免过早套入预设框架。要求AI为每个代码附上原文位置和置信度。

研究者需要检查反例、同义代码和被忽略的少数观点。',
   'AI Compass 编辑部', 'https://aiwiki.liaozhiliang222.workers.dev', '["开放编码","定性分析","原话"]', 'high', 6, datetime('now','-140 minutes'), 'published', 'knowledge', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO articles
  (source_id, category_id, slug, title, summary, why_it_matters, content, source_name, source_url, tags_json, confidence, reading_minutes, published_at, status, content_type, created_at, updated_at)
VALUES
  (1, (SELECT id FROM categories WHERE slug = 'research'), 'thematic-analysis-ai', '如何用AI进行主题分析',
   '主题分析需要从代码中识别模式、关系和差异，并持续回到原始材料验证。',
   'AI擅长聚类和整理，但主题命名与解释仍需要研究判断。',
   '先建立代码清单，再让AI按相似性、因果关系或用户旅程聚类。每个主题应包含定义、包含与排除标准、代表原话和反例。

主题不能只根据出现频次确定，还要考虑其对研究问题的重要性。',
   'AI Compass 编辑部', 'https://aiwiki.liaozhiliang222.workers.dev', '["主题分析","聚类","洞察"]', 'high', 7, datetime('now','-133 minutes'), 'published', 'knowledge', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO articles
  (source_id, category_id, slug, title, summary, why_it_matters, content, source_name, source_url, tags_json, confidence, reading_minutes, published_at, status, content_type, created_at, updated_at)
VALUES
  (1, (SELECT id FROM categories WHERE slug = 'research'), 'qualitative-evidence-chain', '定性洞察如何建立证据链',
   '每条洞察应能回溯到样本、原话、代码和分析过程，而不是只呈现一句漂亮结论。',
   '证据链决定报告能否经受客户追问和团队复核。',
   '可以建立“原话—代码—主题—洞察—建议”的层级结构，并记录支持样本与反例。

AI生成结论时应同时输出证据引用，研究者再判断证据是否充分和具有代表性。',
   'AI Compass 编辑部', 'https://aiwiki.liaozhiliang222.workers.dev', '["证据链","定性洞察","研究质量"]', 'high', 6, datetime('now','-126 minutes'), 'published', 'knowledge', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO articles
  (source_id, category_id, slug, title, summary, why_it_matters, content, source_name, source_url, tags_json, confidence, reading_minutes, published_at, status, content_type, created_at, updated_at)
VALUES
  (1, (SELECT id FROM categories WHERE slug = 'research'), 'survey-open-end-analysis', 'AI如何分析问卷开放题',
   '先清洗无效回答，再建立分类框架、编码全部回答并统计频次，同时保留典型原话。',
   '开放题需要兼顾规模化统计和语义细节，不能只做词频。',
   '可以用少量样本迭代分类框架，再让AI批量编码并输出多标签结果。对低置信度和“其他”类别进行人工复核。

报告中应同时展示占比、样本量、典型表达和群体差异。',
   'AI Compass 编辑部', 'https://aiwiki.liaozhiliang222.workers.dev', '["开放题","问卷","文本编码"]', 'high', 6, datetime('now','-119 minutes'), 'published', 'knowledge', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO articles
  (source_id, category_id, slug, title, summary, why_it_matters, content, source_name, source_url, tags_json, confidence, reading_minutes, published_at, status, content_type, created_at, updated_at)
VALUES
  (1, (SELECT id FROM categories WHERE slug = 'research'), 'insight-vs-finding', '研究发现与洞察有什么区别',
   '发现描述发生了什么，洞察进一步解释为什么发生、对谁重要以及意味着什么。',
   '区分两者可以避免报告停留在数据复述。',
   '“用户认为流程复杂”是发现；“用户缺少进度反馈，因此把等待误判为系统故障”更接近洞察。

高质量洞察需要证据、机制解释、适用人群和业务含义，并能导出可行动建议。',
   'AI Compass 编辑部', 'https://aiwiki.liaozhiliang222.workers.dev', '["洞察","研究发现","业务建议"]', 'high', 6, datetime('now','-112 minutes'), 'published', 'knowledge', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO articles
  (source_id, category_id, slug, title, summary, why_it_matters, content, source_name, source_url, tags_json, confidence, reading_minutes, published_at, status, content_type, created_at, updated_at)
VALUES
  (1, (SELECT id FROM categories WHERE slug = 'research'), 'counterexample-analysis', '为什么研究中必须检查反例',
   '反例能够暴露主题边界、样本差异和过度概括，帮助形成更准确的结论。',
   'AI倾向于合并相似信息，主动寻找反例可以减少单一叙事。',
   '对每个主题要求列出不符合该模式的样本，并解释差异来自人群、场景还是偶然因素。

反例不一定推翻结论，但可能提示需要细分人群或增加适用条件。',
   'AI Compass 编辑部', 'https://aiwiki.liaozhiliang222.workers.dev', '["反例","研究严谨性","样本差异"]', 'high', 5, datetime('now','-105 minutes'), 'published', 'knowledge', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO articles
  (source_id, category_id, slug, title, summary, why_it_matters, content, source_name, source_url, tags_json, confidence, reading_minutes, published_at, status, content_type, created_at, updated_at)
VALUES
  (1, (SELECT id FROM categories WHERE slug = 'research'), 'research-report-storyline', '研究报告故事线如何搭建',
   '故事线应围绕客户决策问题组织，从现状、原因、影响到机会和建议逐步推进。',
   '以决策为主线，比按照问卷题目或访谈顺序罗列结果更有说服力。',
   '先明确报告读完后客户需要做什么决定，再筛选最能支持决策的证据。每一页应回答一个问题，并与前后页形成逻辑关系。

AI可以帮助检查重复、跳跃和证据缺口，但核心观点必须由研究者负责。',
   'AI Compass 编辑部', 'https://aiwiki.liaozhiliang222.workers.dev', '["报告故事线","咨询表达","决策"]', 'high', 6, datetime('now','-98 minutes'), 'published', 'knowledge', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO articles
  (source_id, category_id, slug, title, summary, why_it_matters, content, source_name, source_url, tags_json, confidence, reading_minutes, published_at, status, content_type, created_at, updated_at)
VALUES
  (1, (SELECT id FROM categories WHERE slug = 'research'), 'mixed-methods-ai', 'AI如何支持定量与定性融合分析',
   '定量说明规模和差异，定性解释原因与机制，AI可以帮助建立两类证据之间的关联。',
   '融合分析能避免只看数字或只讲故事。',
   '先从定量结果识别关键人群和异常，再用访谈材料解释原因；也可以从定性主题提出假设，再回到数据验证。

AI可辅助匹配主题、变量和原话，但必须避免用少量案例替代总体结论。',
   'AI Compass 编辑部', 'https://aiwiki.liaozhiliang222.workers.dev', '["混合研究","定量","定性"]', 'high', 7, datetime('now','-91 minutes'), 'published', 'knowledge', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO articles
  (source_id, category_id, slug, title, summary, why_it_matters, content, source_name, source_url, tags_json, confidence, reading_minutes, published_at, status, content_type, created_at, updated_at)
VALUES
  (1, (SELECT id FROM categories WHERE slug = 'governance'), 'ai-privacy-basics', '使用AI时如何保护个人隐私',
   '应遵循数据最小化、明确目的、获得授权、限制访问和及时删除等原则。',
   '模型能力再强，也不应以不必要地暴露个人信息为代价。',
   '发送给AI前应删除姓名、联系方式、身份证号和可识别细节，必要时使用企业批准的服务或本地方案。

还要了解供应商是否保存输入、是否用于训练，以及数据存储地区和删除机制。',
   'AI Compass 编辑部', 'https://aiwiki.liaozhiliang222.workers.dev', '["隐私","个人信息","数据最小化"]', 'high', 6, datetime('now','-84 minutes'), 'published', 'knowledge', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO articles
  (source_id, category_id, slug, title, summary, why_it_matters, content, source_name, source_url, tags_json, confidence, reading_minutes, published_at, status, content_type, created_at, updated_at)
VALUES
  (1, (SELECT id FROM categories WHERE slug = 'governance'), 'confidential-data-ai', '企业机密能否上传到公共AI工具',
   '未经组织批准，不应把客户资料、未公开战略、源代码或合同直接上传到公共工具。',
   '一次便利操作可能造成长期数据和合规风险。',
   '企业应对数据分级，规定哪些内容可以使用外部模型、哪些必须脱敏、哪些只能在内部环境处理。

员工需要明确的工具白名单和操作指引，而不是仅靠一句“注意保密”。',
   'AI Compass 编辑部', 'https://aiwiki.liaozhiliang222.workers.dev', '["企业机密","数据分级","合规"]', 'high', 5, datetime('now','-77 minutes'), 'published', 'knowledge', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO articles
  (source_id, category_id, slug, title, summary, why_it_matters, content, source_name, source_url, tags_json, confidence, reading_minutes, published_at, status, content_type, created_at, updated_at)
VALUES
  (1, (SELECT id FROM categories WHERE slug = 'governance'), 'ai-copyright-basics', 'AI生成内容的版权问题应如何理解',
   '版权归属、训练数据合法性和生成内容侵权风险因地区与场景而异，不能一概而论。',
   '商业使用前应核实来源、授权和当地法律要求。',
   'AI生成内容可能与已有作品相似，也可能缺乏足够人类创作而难以获得完整版权保护。

企业应保留创作过程、人工修改和素材授权记录，对品牌、图片、音乐和代码尤其谨慎。',
   'AI Compass 编辑部', 'https://aiwiki.liaozhiliang222.workers.dev', '["版权","生成内容","授权"]', 'high', 6, datetime('now','-70 minutes'), 'published', 'knowledge', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO articles
  (source_id, category_id, slug, title, summary, why_it_matters, content, source_name, source_url, tags_json, confidence, reading_minutes, published_at, status, content_type, created_at, updated_at)
VALUES
  (1, (SELECT id FROM categories WHERE slug = 'governance'), 'source-citation-rules', 'AI回答为什么必须标注来源',
   '来源让用户能够核验事实、判断时效和理解结论依据。',
   '没有来源的流畅答案不适合承担高可信知识服务。',
   '引用应指向真正支持结论的原始资料，而不是只列一个相关链接。对数字、政策和产品变化，需要标明发布时间和适用范围。

AI知识库还应记录抓取时间、内容版本和是否经过人工审核。',
   'AI Compass 编辑部', 'https://aiwiki.liaozhiliang222.workers.dev', '["来源引用","可追溯性","可信度"]', 'high', 5, datetime('now','-63 minutes'), 'published', 'knowledge', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO articles
  (source_id, category_id, slug, title, summary, why_it_matters, content, source_name, source_url, tags_json, confidence, reading_minutes, published_at, status, content_type, created_at, updated_at)
VALUES
  (1, (SELECT id FROM categories WHERE slug = 'governance'), 'ai-bias-fairness', 'AI偏见从哪里来',
   '偏见可能来自训练数据、标注标准、样本不均、产品目标和使用方式。',
   '即使模型没有恶意，也可能对不同群体产生不公平结果。',
   '评估偏见不能只看模型回答，还要观察真实流程中的筛选、排序和决策后果。

高影响场景应使用代表性测试样本、分群指标、人工申诉和持续监控。',
   'AI Compass 编辑部', 'https://aiwiki.liaozhiliang222.workers.dev', '["偏见","公平性","评测"]', 'high', 6, datetime('now','-56 minutes'), 'published', 'knowledge', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO articles
  (source_id, category_id, slug, title, summary, why_it_matters, content, source_name, source_url, tags_json, confidence, reading_minutes, published_at, status, content_type, created_at, updated_at)
VALUES
  (1, (SELECT id FROM categories WHERE slug = 'governance'), 'prompt-injection', '什么是提示注入攻击',
   '提示注入是攻击者在网页、文件或用户输入中植入指令，诱导Agent忽略原有规则或泄露数据。',
   '具备检索和工具调用能力的AI系统尤其需要防范。',
   '不能只依靠系统提示抵御攻击。应隔离不可信内容、限制工具权限、对敏感操作二次确认，并过滤模型输出。

检索到的网页和文档应被视为数据，而不是自动拥有更高优先级的指令。',
   'AI Compass 编辑部', 'https://aiwiki.liaozhiliang222.workers.dev', '["提示注入","Agent安全","攻击"]', 'high', 6, datetime('now','-49 minutes'), 'published', 'knowledge', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO articles
  (source_id, category_id, slug, title, summary, why_it_matters, content, source_name, source_url, tags_json, confidence, reading_minutes, published_at, status, content_type, created_at, updated_at)
VALUES
  (1, (SELECT id FROM categories WHERE slug = 'governance'), 'least-privilege-agents', 'AI Agent为什么要遵循最小权限',
   'Agent只应获得完成当前任务所需的最低权限和最短授权时间。',
   '权限过大会把一次模型错误放大为真实损失。',
   '读取、写入、删除和付款等权限应分开，并对不可逆操作设置人工确认。

工具调用需要审计日志、速率限制、预算和异常检测，不能把完整账号权限直接交给模型。',
   'AI Compass 编辑部', 'https://aiwiki.liaozhiliang222.workers.dev', '["最小权限","Agent","访问控制"]', 'high', 5, datetime('now','-42 minutes'), 'published', 'knowledge', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO articles
  (source_id, category_id, slug, title, summary, why_it_matters, content, source_name, source_url, tags_json, confidence, reading_minutes, published_at, status, content_type, created_at, updated_at)
VALUES
  (1, (SELECT id FROM categories WHERE slug = 'governance'), 'ai-disclosure', '什么时候应标注内容由AI生成',
   '当AI参与生成可能影响用户判断、信任或权益的内容时，应明确披露其参与程度。',
   '透明标识有助于用户理解内容来源和责任边界。',
   '标识方式应与场景匹配，例如“AI辅助整理”“AI生成草稿，已由编辑审核”或“自动生成，未经人工核验”。

不能用模糊措辞掩盖自动化程度，具体要求还需遵循当地法规和平台规则。',
   'AI Compass 编辑部', 'https://aiwiki.liaozhiliang222.workers.dev', '["AI标识","透明度","责任"]', 'high', 5, datetime('now','-35 minutes'), 'published', 'knowledge', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO articles
  (source_id, category_id, slug, title, summary, why_it_matters, content, source_name, source_url, tags_json, confidence, reading_minutes, published_at, status, content_type, created_at, updated_at)
VALUES
  (1, (SELECT id FROM categories WHERE slug = 'governance'), 'data-retention-ai', 'AI系统为什么需要数据保留期限',
   '长期保存输入、日志和生成结果会增加泄露、滥用和合规风险。',
   '不是所有数据都值得永久留存，应根据业务目的设定期限。',
   '区分运行日志、用户内容、训练数据和审计记录，为不同数据设置保留与删除策略。

还应支持用户删除请求，并确保备份、缓存和第三方服务同步执行。',
   'AI Compass 编辑部', 'https://aiwiki.liaozhiliang222.workers.dev', '["数据保留","删除机制","隐私"]', 'high', 5, datetime('now','-28 minutes'), 'published', 'knowledge', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO articles
  (source_id, category_id, slug, title, summary, why_it_matters, content, source_name, source_url, tags_json, confidence, reading_minutes, published_at, status, content_type, created_at, updated_at)
VALUES
  (1, (SELECT id FROM categories WHERE slug = 'governance'), 'ai-risk-tiering', '如何给AI应用划分风险等级',
   '可根据影响对象、决策后果、自动化程度、数据敏感性和可逆性划分低中高风险。',
   '分级后才能把审核、测试和权限资源投入到最需要的地方。',
   '低风险如文案草稿，中风险如内部分析建议，高风险如影响就业、医疗、信贷或法律权益的决策。

风险等级不是固定标签，应随着用户规模、功能权限和使用场景变化而调整。',
   'AI Compass 编辑部', 'https://aiwiki.liaozhiliang222.workers.dev', '["风险分级","治理","高风险AI"]', 'high', 6, datetime('now','-21 minutes'), 'published', 'knowledge', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO articles
  (source_id, category_id, slug, title, summary, why_it_matters, content, source_name, source_url, tags_json, confidence, reading_minutes, published_at, status, content_type, created_at, updated_at)
VALUES
  (1, (SELECT id FROM categories WHERE slug = 'governance'), 'vendor-security-review', '选择AI供应商要检查哪些安全事项',
   '应检查数据使用、加密、访问控制、审计、事件响应、服务地区和子处理商。',
   '模型效果只是选型的一部分，供应商安全决定企业数据是否可控。',
   '合同和隐私政策中要确认输入是否用于训练、保存多久、能否关闭日志，以及发生安全事件时如何通知。

关键业务还需要评估服务可用性、数据导出和供应商替换能力。',
   'AI Compass 编辑部', 'https://aiwiki.liaozhiliang222.workers.dev', '["供应商评估","安全","合同"]', 'high', 6, datetime('now','-14 minutes'), 'published', 'knowledge', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO articles
  (source_id, category_id, slug, title, summary, why_it_matters, content, source_name, source_url, tags_json, confidence, reading_minutes, published_at, status, content_type, created_at, updated_at)
VALUES
  (1, (SELECT id FROM categories WHERE slug = 'governance'), 'responsible-ai-checklist', '上线AI功能前的责任清单',
   '上线前应明确用途、用户、数据、风险、评测、人工审核、申诉和退出机制。',
   '一份简单清单可以避免团队只关注模型效果而忽略真实后果。',
   '产品需要说明AI能做什么、不能做什么，以及出现错误时由谁处理。建立测试集、监控指标和事故响应流程。

上线后持续收集失败案例和用户反馈，并根据风险变化调整权限与提示。',
   'AI Compass 编辑部', 'https://aiwiki.liaozhiliang222.workers.dev', '["负责任AI","上线检查","治理"]', 'high', 6, datetime('now','-7 minutes'), 'published', 'knowledge', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
