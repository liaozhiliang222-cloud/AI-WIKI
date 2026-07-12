-- 将 Google 来源收窄到 AI 频道，减少无关内容。
UPDATE sources
SET feed_url = 'https://blog.google/technology/ai/rss/',
    site_url = 'https://blog.google/technology/ai/',
    updated_at = CURRENT_TIMESTAMP
WHERE name = 'Google AI Blog';

-- 英文官方 / 一手来源。
INSERT OR IGNORE INTO sources (name, feed_url, site_url, source_type, trust_level, active) VALUES
  ('Google DeepMind', 'https://deepmind.google/blog/rss.xml', 'https://deepmind.google/blog/', 'rss', 5, 1),
  ('Google Research', 'https://research.google/blog/rss/', 'https://research.google/blog/', 'rss', 5, 1),
  ('Hugging Face Blog', 'https://huggingface.co/blog/feed.xml', 'https://huggingface.co/blog', 'rss', 5, 1),
  ('GitHub AI & ML', 'https://github.blog/ai-and-ml/feed/', 'https://github.blog/ai-and-ml/', 'rss', 5, 1),
  ('Microsoft AI Blog', 'https://blogs.microsoft.com/ai/feed/', 'https://blogs.microsoft.com/ai/', 'rss', 5, 1),
  ('AWS Machine Learning Blog', 'https://aws.amazon.com/blogs/machine-learning/feed/', 'https://aws.amazon.com/blogs/machine-learning/', 'rss', 5, 1),
  ('NVIDIA Newsroom', 'https://nvidianews.nvidia.com/rss', 'https://nvidianews.nvidia.com/', 'rss', 5, 1),
  ('arXiv cs.AI', 'https://rss.arxiv.org/rss/cs.AI', 'https://arxiv.org/list/cs.AI/recent', 'rss', 5, 1),
  ('arXiv cs.LG', 'https://rss.arxiv.org/rss/cs.LG', 'https://arxiv.org/list/cs.LG/recent', 'rss', 5, 1),
  ('arXiv cs.CL', 'https://rss.arxiv.org/rss/cs.CL', 'https://arxiv.org/list/cs.CL/recent', 'rss', 5, 1);

-- 中文来源。部分为综合科技媒体，后端会先做 AI 相关性过滤。
INSERT OR IGNORE INTO sources (name, feed_url, site_url, source_type, trust_level, active) VALUES
  ('量子位', 'https://www.qbitai.com/feed', 'https://www.qbitai.com/', 'rss', 4, 1),
  ('少数派', 'https://sspai.com/feed', 'https://sspai.com/', 'rss', 4, 1),
  ('爱范儿', 'https://www.ifanr.com/feed', 'https://www.ifanr.com/', 'rss', 4, 1),
  ('钛媒体', 'https://www.tmtpost.com/feed', 'https://www.tmtpost.com/', 'rss', 4, 1),
  ('阮一峰的网络日志', 'https://www.ruanyifeng.com/blog/atom.xml', 'https://www.ruanyifeng.com/blog/', 'atom', 4, 1),
  ('人人都是产品经理', 'https://www.woshipm.com/feed', 'https://www.woshipm.com/', 'rss', 4, 1);
