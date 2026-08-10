export interface Env {
  DB: D1Database;
  AI: Ai;
  CONTENT_QUEUE: Queue<QueueJob>;
  ADMIN_TOKEN: string;
  APP_NAME: string;
  AI_MODEL: string;
  ENABLE_AUTO_PUBLISH: string;
}

export type QueueJob =
  | { type: "scan_source"; sourceId: number }
  | { type: "process_item"; sourceItemId: number }
  | { type: "reprocess_item"; sourceItemId: number };

export type FeedItem = {
  externalId: string;
  title: string;
  url: string;
  publishedAt: string;
  description: string;
  author: string;
};

export type ArticleRow = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  why_it_matters: string;
  content: string;
  original_title: string;
  original_content: string;
  source_language: string;
  source_name: string;
  source_url: string;
  published_at: string;
  updated_at: string;
  category_slug: string;
  category_name: string;
  tags_json: string;
  reading_minutes: number;
  confidence: "high" | "medium" | "low";
  content_type: "knowledge" | "news";
  knowledge_level: "glossary" | "deep_dive" | "guide" | "case_study";
  difficulty: "beginner" | "intermediate" | "advanced";
  audience_json: string;
  references_json: string;
  related_slugs_json: string;
  review_status: string;
  reviewed_at: string | null;
  content_format: "plain" | "markdown";
  featured: number;
  audience_value: "consumer" | "professional" | "technical";
};
