export type ContentType = "knowledge" | "news";

export type Category = {
  id: number;
  slug: string;
  name: string;
  description: string;
  article_count: number;
};

export type Article = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  why_it_matters: string;
  content: string;
  original_title?: string;
  original_content?: string;
  source_language?: string;
  source_name: string;
  source_url: string;
  published_at: string;
  updated_at: string;
  category_slug: string;
  category_name: string;
  tags: string[];
  reading_minutes: number;
  confidence: "high" | "medium" | "low";
  content_type: ContentType;
};

export type DigestType = "daily" | "weekly";

export type Digest = {
  id: number;
  brief_type: DigestType;
  title: string;
  intro: string;
  highlights: Array<{
    title: string;
    summary: string;
    analysis?: string;
    takeaways?: string[];
    article_slug?: string;
  }>;
  period_start: string;
  period_end: string;
  published_at: string;
};

export type Dashboard = {
  stats: {
    knowledge_count: number;
    news_count: number;
    source_count: number;
    updated_in_7d: number;
    category_count: number;
  };
  categories: Category[];
  latest_knowledge: Article[];
  latest_news: Article[];
  latest_daily: Digest | null;
  latest_weekly: Digest | null;
};

export type Source = {
  id: number;
  name: string;
  feed_url: string;
  site_url: string;
  source_type: string;
  trust_level: number;
  active: number;
  last_checked_at: string | null;
  last_success_at: string | null;
  last_error: string | null;
};
