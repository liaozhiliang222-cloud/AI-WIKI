-- 0011: 修复英文资讯“中文解读”正文仍为英文的问题。
-- 对标题或正文仍等于原文的资讯，统一标记为英文待重处理；
-- Worker 后台的“修复资讯库中文正文”会据此重新送入翻译队列。
UPDATE articles
SET source_language = 'en',
    updated_at = CURRENT_TIMESTAMP
WHERE content_type = 'news'
  AND source_item_id IS NOT NULL
  AND original_title <> ''
  AND original_content <> ''
  AND (
    title = original_title
    OR content = original_content
    OR length(trim(content)) < 120
  );
