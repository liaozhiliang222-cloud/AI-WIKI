-- 0010: 强化精品周报中文解读，并重新处理英文资讯。

UPDATE articles
SET source_language = 'en',
    updated_at = CURRENT_TIMESTAMP
WHERE content_type = 'news'
  AND source_name IN (
    'OpenAI News', 'Cloudflare Blog', 'Google AI Blog', 'Google DeepMind',
    'Google Research', 'Hugging Face Blog', 'GitHub AI & ML', 'Microsoft AI Blog',
    'AWS Machine Learning Blog', 'NVIDIA Newsroom', 'arXiv cs.AI', 'arXiv cs.LG', 'arXiv cs.CL'
  );

-- 旧周报不包含“中文深度解读/行动建议”字段，归档后由管理员重新生成新版周报。
UPDATE briefs
SET status = 'archived',
    updated_at = CURRENT_TIMESTAMP
WHERE brief_type = 'weekly'
  AND status = 'published';
