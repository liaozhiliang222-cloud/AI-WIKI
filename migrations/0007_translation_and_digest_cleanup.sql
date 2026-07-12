ALTER TABLE articles ADD COLUMN original_title TEXT NOT NULL DEFAULT '';
ALTER TABLE articles ADD COLUMN original_content TEXT NOT NULL DEFAULT '';
ALTER TABLE articles ADD COLUMN source_language TEXT NOT NULL DEFAULT 'zh';

UPDATE articles
SET original_title = CASE WHEN original_title = '' THEN title ELSE original_title END,
    original_content = CASE WHEN original_content = '' THEN content ELSE original_content END
WHERE original_title = '' OR original_content = '';

UPDATE briefs
SET status = 'archived', updated_at = CURRENT_TIMESTAMP
WHERE title LIKE '%产品初始化演示版%';

CREATE INDEX IF NOT EXISTS idx_articles_source_language
  ON articles(source_language, content_type, status, updated_at DESC);
