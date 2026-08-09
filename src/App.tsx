import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import type { Root } from "mdast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { visit } from "unist-util-visit";
import {
  ArrowRight,
  BookOpen,
  Bot,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Compass,
  Copy,
  Database,
  ExternalLink,
  FileText,
  Home,
  Languages,
  Library,
  List,
  Menu,
  Plus,
  RefreshCw,
  Rss,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { api } from "./api";
import type {
  Article,
  Category,
  ContentType,
  Dashboard,
  Difficulty,
  Digest,
  DigestType,
  KnowledgeLevel,
  KnowledgeOverview,
  Source,
} from "./types";

type View =
  | "home"
  | "knowledge"
  | "daily"
  | "weekly"
  | "news"
  | "ask"
  | "admin"
  | "article";

const demoCategories: Category[] = [
  {
    id: 1,
    slug: "basics",
    name: "基础概念",
    description: "用通俗语言理解模型、Token、上下文与推理。",
    article_count: 2,
  },
  {
    id: 2,
    slug: "products",
    name: "模型与产品",
    description: "理解主流模型、工具与产品能力变化。",
    article_count: 1,
  },
  {
    id: 3,
    slug: "practice",
    name: "应用实践",
    description: "从提示词到可复用工作流的实操指南。",
    article_count: 1,
  },
  {
    id: 4,
    slug: "research",
    name: "研究与咨询",
    description: "访谈、编码、洞察与报告生产的AI方法。",
    article_count: 1,
  },
];

const demoKnowledge: Article[] = [
  {
    id: 1,
    slug: "what-is-token",
    title: "Token是什么？为什么字数不等于Token数",
    summary:
      "Token是模型处理文本的基本单位，可能是一个字、词的一部分或标点，不同模型的切分方式并不完全相同。",
    why_it_matters:
      "Token直接影响上下文容量、调用成本和输出长度，是理解大模型使用限制的第一步。",
    content:
      "模型并不是逐字阅读文本，而是先把内容切分成Token再进行计算。中文通常一个汉字可能接近一个Token，但数字、英文和特殊符号的切分会更复杂。\n\n设计提示词和知识库时，不应只看字符数。更稳妥的做法是控制信息密度、删除重复内容，并为长文档预留模型输出所需的Token空间。",
    source_name: "AI Compass 编辑部",
    source_url: "#",
    published_at: "2026-07-09T08:00:00Z",
    updated_at: "2026-07-10T08:00:00Z",
    category_slug: "basics",
    category_name: "基础概念",
    tags: ["Token", "大模型基础", "成本"],
    reading_minutes: 4,
    confidence: "high",
    content_type: "knowledge",
    knowledge_level: "glossary",
    difficulty: "beginner",
    audience: ["AI用户", "产品经理"],
    references: [],
    related_slugs: ["rag-vs-long-context"],
    content_format: "plain",
    review_status: "published",
  },
  {
    id: 2,
    slug: "rag-vs-long-context",
    title: "RAG与直接塞入长文本，有什么本质区别？",
    summary:
      "RAG先检索相关片段再交给模型，长上下文则把更多材料一次性提供给模型，两者适合不同任务。",
    why_it_matters:
      "知识库问答通常更适合以检索为主、长上下文为辅，兼顾可追溯性与成本。",
    content:
      "## 核心区别\n\nRAG的核心是先从知识库中找到与问题最相关的内容，再让模型基于这些内容回答。它有利于展示来源、更新知识和控制成本。\n\n长上下文更适合材料规模可控、文档之间关系复杂、需要全局理解的任务。成熟系统不会把二者视为二选一，而是根据问题动态选择。\n\n## 决策场景\n\n- 企业知识库问答：选RAG\n- 单份复杂文档深度理解：选长上下文\n- 客服系统：两者混合",
    source_name: "AI Compass 编辑部",
    source_url: "#",
    published_at: "2026-07-08T08:00:00Z",
    updated_at: "2026-07-08T08:00:00Z",
    category_slug: "basics",
    category_name: "基础概念",
    tags: ["RAG", "知识库", "检索"],
    reading_minutes: 5,
    confidence: "high",
    content_type: "knowledge",
    knowledge_level: "deep_dive",
    difficulty: "intermediate",
    audience: ["产品经理", "独立开发者"],
    references: [
      {
        title: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks",
        publisher: "arXiv",
        url: "https://arxiv.org/abs/2005.11401",
        official: true,
      },
    ],
    related_slugs: ["what-is-token"],
    content_format: "markdown",
    review_status: "editorial",
  },
  {
    id: 3,
    slug: "prompt-debugging",
    title: "AI回答不好时，如何系统调试提示词",
    summary:
      "提示词写不好，多数不是措辞不够好，而是任务设计有问题。本文给出七步调试框架。",
    why_it_matters:
      "把随机改词重试变成按诊断树定位问题，调试Prompt的时间可以缩短一个数量级。",
    content:
      "## Step 1：信息是否足够\n\n模型需要的所有事实是否都在输入里？信息不足是幻觉的第一来源。\n\n## Step 2：目标是否清楚\n\n用「角色+目标+输入+规则+输出+校验」结构重写提示词。\n\n## Step 3：规则是否冲突\n\n规则逐条编号，用示例表达模糊要求。\n\n## Step 4：是否需要示例\n\n一个高质量示例胜过三句规则描述。",
    source_name: "AI Compass 编辑部",
    source_url: "#",
    published_at: "2026-07-07T08:00:00Z",
    updated_at: "2026-07-07T08:00:00Z",
    category_slug: "practice",
    category_name: "应用实践",
    tags: ["提示词", "调试", "工作流"],
    reading_minutes: 6,
    confidence: "high",
    content_type: "knowledge",
    knowledge_level: "guide",
    difficulty: "beginner",
    audience: ["AI用户", "知识工作者"],
    references: [
      {
        title: "OpenAI Prompt Engineering 官方指南",
        publisher: "OpenAI",
        url: "https://platform.openai.com/docs/guides/prompt-engineering",
        official: true,
      },
    ],
    related_slugs: ["rag-vs-long-context"],
    content_format: "markdown",
    review_status: "editorial",
  },
  {
    id: 4,
    slug: "open-coding-ai",
    title: "AI如何辅助开放编码",
    summary:
      "教学示例：从访谈原话出发，经过开放编码、编码合并、主题归纳、反例检查到洞察形成的完整过程。",
    why_it_matters:
      "把研究过程拆成可核验的环节，AI的产出才真正可用；AI提出、研究者裁决。",
    content:
      "> 本文是教学示例：所有访谈数据均为虚构。\n\n## 输入：访谈原话\n\n- P01：我到现在还是习惯用邮件，同事在软件里@我，我经常隔天才看到。\n- P02：工具太多了，每天光切换就烦死了。\n\n## 开放编码\n\n- 习惯性使用旧工具（P01）\n- 新工具消息不及时查看（P01）\n- 工具数量过多（P02）\n- 多工具切换负担（P02）\n\n## 研究者的工作\n\n逐条核对编码是否忠于原话，是否引入模型自己的推断。AI提出、研究者裁决。",
    source_name: "AI Compass 编辑部",
    source_url: "#",
    published_at: "2026-07-06T08:00:00Z",
    updated_at: "2026-07-06T08:00:00Z",
    category_slug: "research",
    category_name: "研究与咨询",
    tags: ["定性研究", "开放编码", "访谈"],
    reading_minutes: 7,
    confidence: "high",
    content_type: "knowledge",
    knowledge_level: "case_study",
    difficulty: "advanced",
    audience: ["研究人员", "知识工作者"],
    references: [
      {
        title: "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models",
        publisher: "arXiv",
        url: "https://arxiv.org/abs/2201.11903",
        official: true,
      },
    ],
    related_slugs: ["prompt-debugging"],
    content_format: "markdown",
    review_status: "editorial",
  },
];

const demoNews: Article[] = [
  {
    ...demoKnowledge[1],
    id: 101,
    slug: "demo-news-knowledge-update",
    title: "演示资讯：知识内容与动态资讯已拆分管理",
    summary:
      "新版同时保留长期有效的AI知识库和自动抓取的资讯库，日报与周报只从动态资讯中生成。",
    why_it_matters:
      "用户既能系统学习基础知识，也能及时跟踪新变化，避免产品退化为单纯新闻聚合器。",
    content:
      "这是一条用于演示产品结构的资讯。正式部署后，RSS与Atom抓取内容会自动进入资讯库，而编辑型、长期有效的内容会保存在AI知识库。\n\n资讯日报和精品周报仅使用动态资讯生成，AI问答则可以同时检索知识库和资讯库。",
    source_name: "AI Compass 产品演示",
    source_url: "#",
    content_type: "news",
  },
  {
    ...demoKnowledge[2],
    id: 102,
    slug: "demo-news-pipeline",
    title: "演示资讯：Cron、Queues与失败重试链路已保留",
    summary:
      "定时任务负责发现新内容，Queues异步完成正文提取、去重、AI摘要、分类、标签和入库。",
    why_it_matters:
      "抓取和AI处理分离后，单个网站失败不会拖垮整批任务，也便于限制成本与排查问题。",
    content:
      "这是用于展示后台处理能力的演示资讯。系统每六小时检查一次启用的信息源，发现新条目后写入队列。\n\n队列消费者会读取网页、清洗正文、调用AI整理并写入D1；失败任务按配置重试，超过次数后进入死信队列。",
    source_name: "AI Compass 产品演示",
    source_url: "#",
    content_type: "news",
  },
  {
    ...demoKnowledge[3],
    id: 103,
    slug: "demo-news-daily-weekly",
    title: "演示资讯：日报负责及时，周报负责精品筛选",
    summary:
      "日报汇总过去24小时变化，周报从一周内容中挑选真正重要、具有持续价值的资讯。",
    why_it_matters:
      "两种内容满足不同阅读节奏，同时所有原始资讯仍可在资讯库中搜索和回溯。",
    content:
      "日报适合每天三分钟快速浏览；精品周报适合每周集中阅读。两者都保留对应资讯条目的链接，所有原始条目也会进入资讯库。",
    source_name: "AI Compass 产品演示",
    source_url: "#",
    content_type: "news",
  },
];

const demoDaily: Digest = {
  id: 1,
  brief_type: "daily",
  title: "今日AI资讯日报 · 产品初始化演示版",
  intro:
    "汇总过去24小时的重要AI动态，去除重复内容，并用简短说明告诉你为什么值得关注。",
  highlights: demoNews.map((item) => ({
    title: item.title,
    summary: item.why_it_matters,
    article_slug: item.slug,
  })),
  period_start: "2026-07-10T00:00:00Z",
  period_end: "2026-07-11T00:00:00Z",
  published_at: "2026-07-11T00:30:00Z",
};

const demoWeekly: Digest = {
  id: 2,
  brief_type: "weekly",
  title: "本周AI精品资讯 · 值得深读的关键变化",
  intro:
    "从一周资讯中筛选真正重要、信息密度高且具有持续影响的内容，减少被热点和重复新闻占用时间。",
  highlights: demoNews.map((item) => ({
    title: item.title,
    summary: item.summary,
    article_slug: item.slug,
  })),
  period_start: "2026-07-04T00:00:00Z",
  period_end: "2026-07-11T00:00:00Z",
  published_at: "2026-07-11T01:00:00Z",
};

const demoDashboard: Dashboard = {
  stats: {
    knowledge_count: demoKnowledge.length,
    news_count: demoNews.length,
    source_count: 3,
    updated_in_7d: 7,
    category_count: 4,
  },
  categories: demoCategories,
  latest_knowledge: demoKnowledge,
  latest_news: demoNews,
  latest_daily: demoDaily,
  latest_weekly: demoWeekly,
};

const navItems: Array<{ id: View; label: string; icon: typeof Home }> = [
  { id: "home", label: "首页", icon: Home },
  { id: "knowledge", label: "AI知识库", icon: BookOpen },
  { id: "daily", label: "资讯日报", icon: FileText },
  { id: "weekly", label: "精品周报", icon: Sparkles },
  { id: "news", label: "资讯库", icon: Library },
  { id: "ask", label: "AI问答", icon: Bot },
  { id: "admin", label: "管理", icon: Settings },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function hasMeaningfulChinese(text?: string, minChars = 12) {
  if (!text) return false;
  const compact = text.replace(/\s+/g, "");
  const chinese = (compact.match(/[\u3400-\u9fff]/g) || []).length;
  return chinese >= minChars && chinese / Math.max(compact.length, 1) >= 0.08;
}

const knowledgeLevelMeta: Record<
  KnowledgeLevel,
  { label: string; short: string }
> = {
  glossary: { label: "基础词条", short: "词条" },
  deep_dive: { label: "深度知识", short: "深度" },
  guide: { label: "实践手册", short: "实践" },
  case_study: { label: "完整案例", short: "案例" },
};

const difficultyMeta: Record<Difficulty, string> = {
  beginner: "入门",
  intermediate: "进阶",
  advanced: "高级",
};

/** 生成稳定、支持中文的标题锚点 ID（去除特殊字符，重复标题自动加序号）。 */
function slugifyAnchor(text: string) {
  return text
    .normalize("NFKC")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function headingIdFor(
  text: string,
  seen: Map<string, number>,
) {
  const base = slugifyAnchor(text) || "section";
  const count = seen.get(base) ?? 0;
  seen.set(base, count + 1);
  return count > 0 ? `${base}-${count + 1}` : base;
}

/** 从 Markdown 正文提取 H2/H3 目录（与渲染端使用同一锚点算法）。 */
function extractHeadings(markdown: string) {
  const headings: Array<{ id: string; text: string; level: number }> = [];
  const seen = new Map<string, number>();
  for (const line of markdown.split("\n")) {
    const match = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
    if (!match) continue;
    const level = match[1].length;
    const text = match[2].replace(/[*`]/g, "").trim();
    if (!text) continue;
    headings.push({ id: headingIdFor(text, seen), text, level });
  }
  return headings;
}

export default function App() {
  const [view, setView] = useState<View>("home");
  const [dashboard, setDashboard] = useState<Dashboard>(demoDashboard);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [articleRelated, setArticleRelated] = useState<Article[]>([]);
  const [articleNav, setArticleNav] = useState<{
    prev: Article | null;
    next: Article | null;
  }>({ prev: null, next: null });
  const [articleBack, setArticleBack] = useState<View>("knowledge");
  const [loading, setLoading] = useState(true);
  const [usingDemo, setUsingDemo] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const allRecent = useMemo(
    () => [...dashboard.latest_knowledge, ...dashboard.latest_news],
    [dashboard],
  );

  async function refreshDashboard() {
    const data = await api.dashboard();
    setDashboard(data);
    setUsingDemo(false);
    return data;
  }

  async function refreshDigest(type: DigestType) {
    if (usingDemo) return;
    try {
      const data = await api.latestDigest(type);
      setDashboard((current) => ({
        ...current,
        [type === "daily" ? "latest_daily" : "latest_weekly"]: data.digest,
      }));
    } catch {
      // 保留当前内容，避免临时网络错误导致页面闪空。
    }
  }

  useEffect(() => {
    refreshDashboard()
      .catch(() => setUsingDemo(true))
      .finally(() => setLoading(false));
  }, []);

  function navigate(next: View) {
    setView(next);
    setMenuOpen(false);
    if (next === "daily" || next === "weekly") void refreshDigest(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function openArticle(article: Article, back?: View) {
    setSelectedArticle(article);
    setArticleRelated([]);
    setArticleNav({ prev: null, next: null });
    setArticleBack(
      back ?? (article.content_type === "news" ? "news" : "knowledge"),
    );
    setView("article");
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (!usingDemo) {
      try {
        const data = await api.article(article.slug);
        setSelectedArticle(data.article);
        setArticleRelated(data.related ?? []);
        setArticleNav({ prev: data.prev ?? null, next: data.next ?? null });
      } catch {
        // 保留列表中的内容，避免详情接口临时失败时出现空页。
      }
    }
  }

  async function openSlug(slug: string) {
    const cached = allRecent.find((item) => item.slug === slug);
    if (cached) return openArticle(cached, "news");
    if (!usingDemo) {
      try {
        const data = await api.article(slug);
        return openArticle(
          data.article,
          data.article.content_type === "news" ? "news" : "knowledge",
        );
      } catch {
        return;
      }
    }
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">
            <Compass size={22} />
          </div>
          <div>
            <strong>AI Compass</strong>
            <span>知识库 · 日报 · 周报</span>
          </div>
        </div>
        <nav className="side-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              view === item.id ||
              (view === "article" && item.id === articleBack);
            return (
              <button
                key={item.id}
                className={active ? "active" : ""}
                onClick={() => navigate(item.id)}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="sidebar-card">
          <div className="eyebrow">
            <Sparkles size={14} /> 持续更新
          </div>
          <p>系统学习AI知识，每天掌握动态，每周读透真正重要的变化。</p>
          <div className="status-line">
            <span className="pulse" /> 系统就绪
          </div>
        </div>
        <p className="sidebar-foot">Cloudflare Workers · D1 · Queues</p>
      </aside>

      {menuOpen && (
        <button
          className="backdrop"
          aria-label="关闭菜单"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <main className="main-area">
        <header className="topbar">
          <button
            className="menu-button"
            onClick={() => setMenuOpen(true)}
            aria-label="打开菜单"
          >
            <Menu size={21} />
          </button>
          <div className="mobile-brand">
            <Compass size={19} />
            <strong>AI Compass</strong>
          </div>
          <div className="topbar-actions">
            {usingDemo && <span className="demo-badge">演示模式</span>}
            <button
              className="icon-button"
              title="刷新"
              onClick={() => window.location.reload()}
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </header>

        <div className="page-wrap">
          {loading ? (
            <LoadingState />
          ) : (
            <>
              {view === "home" && (
                <HomePage
                  dashboard={dashboard}
                  onNavigate={navigate}
                  onOpenArticle={openArticle}
                />
              )}
              {view === "knowledge" && (
                <ContentLibraryPage
                  contentType="knowledge"
                  categories={dashboard.categories}
                  initialArticles={dashboard.latest_knowledge}
                  usingDemo={usingDemo}
                  onOpenArticle={(a) => openArticle(a, "knowledge")}
                />
              )}
              {view === "daily" && (
                <DigestPage
                  type="daily"
                  digest={dashboard.latest_daily}
                  onOpenSlug={openSlug}
                />
              )}
              {view === "weekly" && (
                <DigestPage
                  type="weekly"
                  digest={dashboard.latest_weekly}
                  onOpenSlug={openSlug}
                />
              )}
              {view === "news" && (
                <ContentLibraryPage
                  contentType="news"
                  categories={dashboard.categories}
                  initialArticles={dashboard.latest_news}
                  usingDemo={usingDemo}
                  onOpenArticle={(a) => openArticle(a, "news")}
                />
              )}
              {view === "ask" && (
                <AskPage usingDemo={usingDemo} articles={allRecent} />
              )}
              {view === "admin" && (
                <AdminPage
                  usingDemo={usingDemo}
                  onDigestGenerated={async (type) => {
                    await refreshDigest(type);
                  }}
                />
              )}
              {view === "article" && selectedArticle && (
                <ArticlePage
                  article={selectedArticle}
                  related={articleRelated}
                  prev={articleNav.prev}
                  next={articleNav.next}
                  onBack={() => navigate(articleBack)}
                  onOpenArticle={(a, back) => openArticle(a, back)}
                />
              )}
            </>
          )}
        </div>
      </main>

      <nav className="bottom-nav">
        {navItems.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const active =
            view === item.id || (view === "article" && item.id === articleBack);
          return (
            <button
              key={item.id}
              className={active ? "active" : ""}
              onClick={() => navigate(item.id)}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="loading-state">
      <div className="loading-ring" />
      <p>正在读取AI知识与最新资讯…</p>
    </div>
  );
}

function HomePage({
  dashboard,
  onNavigate,
  onOpenArticle,
}: {
  dashboard: Dashboard;
  onNavigate: (view: View) => void;
  onOpenArticle: (article: Article, back?: View) => void;
}) {
  const featured = dashboard.featured_knowledge?.length
    ? dashboard.featured_knowledge
    : dashboard.latest_knowledge;
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="hero-kicker">
            <Sparkles size={15} /> 学知识、追动态、读重点
          </span>
          <h1>
            不只追AI新闻，
            <br />
            <em>更建立持续进化的知识体系。</em>
          </h1>
          <p>
            AI知识库负责系统普及；资讯日报负责及时更新；精品周报负责筛选真正值得深读的变化。
          </p>
          <div className="hero-actions">
            <button
              className="primary-button"
              onClick={() => onNavigate("knowledge")}
            >
              进入AI知识库 <ArrowRight size={17} />
            </button>
            <button
              className="ghost-button"
              onClick={() => onNavigate("daily")}
            >
              阅读今日日报
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="orb orb-one" />
          <div className="orb orb-two" />
          <div className="knowledge-map">
            <div className="map-center">
              <Compass size={28} />
              <strong>AI知识</strong>
              <span>持续进化</span>
            </div>
            <div className="map-node node-a">
              <BookOpen size={17} /> 基础概念
            </div>
            <div className="map-node node-b">
              <Bot size={17} /> 模型产品
            </div>
            <div className="map-node node-c">
              <Database size={17} /> 工作流
            </div>
            <div className="map-node node-d">
              <ShieldCheck size={17} /> 治理安全
            </div>
          </div>
        </div>
      </section>

      <section className="stats-grid">
        <StatCard
          value={dashboard.stats.knowledge_count}
          label="知识条目"
          note="长期沉淀"
        />
        <StatCard
          value={dashboard.stats.news_count}
          label="资讯条目"
          note="自动归档"
        />
        <StatCard
          value={dashboard.stats.source_count}
          label="权威来源"
          note="官方优先"
        />
        <StatCard
          value={dashboard.stats.updated_in_7d}
          label="近7日更新"
          note="保持鲜活"
        />
      </section>

      <section className="section-block">
        <SectionHeading
          eyebrow="AI知识体系"
          title="从基础概念到应用实践，循序理解AI"
          action="进入知识库"
          onAction={() => onNavigate("knowledge")}
        />
        <div className="category-grid">
          {dashboard.categories.map((category, index) => (
            <button
              key={category.slug}
              className="category-card"
              onClick={() => onNavigate("knowledge")}
            >
              <span className="category-index">0{index + 1}</span>
              <div>
                <h3>{category.name}</h3>
                <p>{category.description}</p>
              </div>
              <div className="category-foot">
                <span>{category.article_count} 条知识</span>
                <ArrowRight size={17} />
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="section-block">
        <SectionHeading
          eyebrow="精选知识"
          title="先理解，再判断新变化"
          action="查看全部知识"
          onAction={() => onNavigate("knowledge")}
        />
        <div className="article-grid">
          {featured.slice(0, 4).map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onClick={() => onOpenArticle(article, "knowledge")}
            />
          ))}
        </div>
      </section>

      <div className="digest-banner-grid">
        {dashboard.latest_daily && (
          <DigestBanner
            digest={dashboard.latest_daily}
            type="daily"
            onClick={() => onNavigate("daily")}
          />
        )}
        {dashboard.latest_weekly && (
          <DigestBanner
            digest={dashboard.latest_weekly}
            type="weekly"
            onClick={() => onNavigate("weekly")}
          />
        )}
      </div>

      <section className="section-block">
        <SectionHeading
          eyebrow="最新资讯"
          title="抓取、去重、摘要并保留原始出处"
          action="进入资讯库"
          onAction={() => onNavigate("news")}
        />
        {dashboard.latest_news.length ? (
          <div className="article-grid">
            {dashboard.latest_news.slice(0, 4).map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onClick={() => onOpenArticle(article, "news")}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state compact">
            <Rss size={24} />
            <p>部署后启用RSS来源，最新资讯会自动出现在这里。</p>
          </div>
        )}
      </section>
    </>
  );
}

function DigestBanner({
  digest,
  type,
  onClick,
}: {
  digest: Digest;
  type: DigestType;
  onClick: () => void;
}) {
  const weekly = type === "weekly";
  return (
    <section className={`brief-banner ${weekly ? "weekly-banner" : ""}`}>
      <div className="brief-icon">
        {weekly ? <Sparkles size={25} /> : <FileText size={25} />}
      </div>
      <div className="brief-banner-copy">
        <span>
          {weekly ? "本周精品周报" : "今日资讯日报"} ·{" "}
          {formatDate(digest.published_at)}
        </span>
        <h2>{digest.title}</h2>
        <p>{digest.intro}</p>
      </div>
      <button onClick={onClick}>
        阅读{weekly ? "周报" : "日报"} <ArrowRight size={17} />
      </button>
    </section>
  );
}

function StatCard({
  value,
  label,
  note,
}: {
  value: number;
  label: string;
  note: string;
}) {
  return (
    <div className="stat-card">
      <strong>{value}</strong>
      <div>
        <span>{label}</span>
        <small>{note}</small>
      </div>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  action,
  onAction,
}: {
  eyebrow: string;
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="section-heading">
      <div>
        <span>{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      {action && (
        <button onClick={onAction}>
          {action}
          <ArrowRight size={16} />
        </button>
      )}
    </div>
  );
}

function ArticleCard({
  article,
  onClick,
}: {
  article: Article;
  onClick: () => void;
}) {
  const translated =
    article.content_type === "news" &&
    article.source_language &&
    article.source_language !== "zh";
  const level =
    article.content_type === "knowledge" && article.knowledge_level
      ? knowledgeLevelMeta[article.knowledge_level]
      : null;
  return (
    <button className="article-card" onClick={onClick}>
      <div className="article-meta">
        <span>
          {article.content_type === "knowledge" ? "知识 · " : "资讯 · "}
          {article.category_name}
          {translated ? " · 中文解读" : ""}
        </span>
        <small>
          <Clock3 size={13} /> {article.reading_minutes}分钟
        </small>
      </div>
      {level && (
        <div className="card-badges">
          <span className={`level-badge level-${article.knowledge_level}`}>
            {level.label}
          </span>
          {article.difficulty && (
            <span className="difficulty-badge">
              {difficultyMeta[article.difficulty]}
            </span>
          )}
        </div>
      )}
      <h3>{article.title}</h3>
      <p>{article.summary}</p>
      <div className="tag-row">
        {article.tags.slice(0, 3).map((tag) => (
          <span key={tag}>#{tag}</span>
        ))}
      </div>
      <div className="article-card-foot">
        <span>{formatDate(article.updated_at)}</span>
        <ArrowRight size={17} />
      </div>
    </button>
  );
}

function ContentLibraryPage({
  contentType,
  categories,
  initialArticles,
  usingDemo,
  onOpenArticle,
}: {
  contentType: ContentType;
  categories: Category[];
  initialArticles: Article[];
  usingDemo: boolean;
  onOpenArticle: (article: Article) => void;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [articles, setArticles] = useState(initialArticles);
  const [searching, setSearching] = useState(false);
  const isKnowledge = contentType === "knowledge";

  useEffect(() => {
    const handle = window.setTimeout(async () => {
      if (usingDemo) {
        const normalized = query.trim().toLowerCase();
        setArticles(
          initialArticles.filter(
            (article) =>
              (!category || article.category_slug === category) &&
              (!level || article.knowledge_level === level) &&
              (!normalized ||
                `${article.title} ${article.summary} ${article.content} ${article.tags.join(" ")}`
                  .toLowerCase()
                  .includes(normalized)),
          ),
        );
        return;
      }
      setSearching(true);
      try {
        const data = await api.articles(query, category, contentType, level as KnowledgeLevel);
        setArticles(data.articles);
      } finally {
        setSearching(false);
      }
    }, 280);
    return () => window.clearTimeout(handle);
  }, [query, category, level, initialArticles, usingDemo, contentType]);

  return (
    <>
      <PageHeader
        eyebrow={isKnowledge ? "AI KNOWLEDGE BASE" : "AI NEWS ARCHIVE"}
        title={isKnowledge ? "AI知识库" : "资讯库"}
        description={
          isKnowledge
            ? "从基础词条到实践手册与完整案例，理解AI、选择AI、使用AI；支持类型、分类与关键词组合筛选。"
            : "保存自动抓取并整理的AI动态；每条资讯保留原文、发布时间、分类、标签和可信度。"
        }
      />
      {isKnowledge && <LearningPaths onOpenArticle={onOpenArticle} />}
      <div className="library-toolbar">
        <label className="search-box">
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={
              isKnowledge
                ? "搜索：RAG、Agent、提示词、访谈分析…"
                : "搜索：模型发布、产品更新、开源、政策…"
            }
          />
          {query && (
            <button onClick={() => setQuery("")}>
              <X size={16} />
            </button>
          )}
        </label>
        <div className="filter-pills">
          <button
            className={!category ? "active" : ""}
            onClick={() => setCategory("")}
          >
            全部
          </button>
          {categories.map((item) => (
            <button
              key={item.slug}
              className={category === item.slug ? "active" : ""}
              onClick={() => setCategory(item.slug)}
            >
              {item.name}
            </button>
          ))}
        </div>
        {isKnowledge && (
          <div className="filter-pills">
            <button
              className={!level ? "active" : ""}
              onClick={() => setLevel("")}
            >
              全部类型
            </button>
            {(Object.keys(knowledgeLevelMeta) as KnowledgeLevel[]).map(
              (key) => (
                <button
                  key={key}
                  className={level === key ? "active" : ""}
                  onClick={() => setLevel(key)}
                >
                  {knowledgeLevelMeta[key].label}
                </button>
              ),
            )}
          </div>
        )}
      </div>
      <div className="result-line">
        <span>
          找到 {articles.length} 条{isKnowledge ? "知识" : "资讯"}
        </span>
        {searching && (
          <span>
            <RefreshCw size={14} className="spin" /> 检索中
          </span>
        )}
      </div>
      {articles.length ? (
        <div className="article-grid">
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onClick={() => onOpenArticle(article)}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Search size={28} />
          <h3>没有找到匹配内容</h3>
          <p>
            {isKnowledge
              ? "换一个关键词，或者清除类型/分类筛选。"
              : "部署后检查资讯源，或换一个关键词搜索。"}
          </p>
        </div>
      )}
    </>
  );
}

const learningPathConfig: Array<{
  title: string;
  desc: string;
  slugs: string[];
}> = [
  {
    title: "我刚开始了解AI",
    desc: "先建立正确的心智模型",
    slugs: ["what-is-llm", "what-is-token", "what-is-context-window", "hallucination-explained"],
  },
  {
    title: "我要开始用AI工作",
    desc: "把AI变成可用的生产力",
    slugs: ["prompt-debugging", "structured-output", "document-summary-workflow", "ai-search-vs-chat"],
  },
  {
    title: "我要做AI产品",
    desc: "选型、算账、上生产",
    slugs: ["model-selection-framework", "ai-api-cost-model", "copilot-vs-agent", "model-benchmark-limits", "fallback-strategy"],
  },
  {
    title: "我要做研究与分析",
    desc: "用AI辅助定性研究",
    slugs: ["interview-guide-ai", "open-coding-ai", "thematic-analysis-ai", "qualitative-evidence-chain"],
  },
];

function LearningPaths({ onOpenArticle }: { onOpenArticle: (a: Article) => void }) {
  return (
    <section className="learning-paths" aria-label="推荐学习路径">
      <div className="learning-paths-head">
        <div>
          <span>从哪里开始？</span>
          <h2>按你的目标选择学习路径</h2>
        </div>
        <small>路径仅按slug配置，文章不存在时自动跳过</small>
      </div>
      <div className="learning-path-grid">
        {learningPathConfig.map((path) => (
          <div className="learning-path-card" key={path.title}>
            <h3>{path.title}</h3>
            <p>{path.desc}</p>
            <ul>
              {path.slugs.map((slug) => (
                <PathLink key={slug} slug={slug} onOpenArticle={onOpenArticle} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function PathLink({
  slug,
  onOpenArticle,
}: {
  slug: string;
  onOpenArticle: (a: Article) => void;
}) {
  // 演示模式与线上模式都通过详情接口获取文章，避免写死文章对象。
  const [title, setTitle] = useState("");
  const [missing, setMissing] = useState(false);
  useEffect(() => {
    let alive = true;
    const cached = demoKnowledge.find((item) => item.slug === slug);
    if (cached) {
      setTitle(cached.title);
      return;
    }
    api
      .article(slug)
      .then((data) => {
        if (!alive) return;
        setTitle(data.article.title);
      })
      .catch(() => alive && setMissing(true));
    return () => {
      alive = false;
    };
  }, [slug]);
  if (missing) return null;
  return (
    <li>
      <button
        onClick={async () => {
          // 用当前知识库中的文章打开；找不到时直接请求详情。
          const cached = demoKnowledge.find((item) => item.slug === slug);
          if (cached) return onOpenArticle(cached);
          try {
            const data = await api.article(slug);
            onOpenArticle(data.article);
          } catch {
            setMissing(true);
          }
        }}
      >
        <BookOpen size={14} />
        {title || "加载中…"}
      </button>
    </li>
  );
}

function DigestPage({
  type,
  digest,
  onOpenSlug,
}: {
  type: DigestType;
  digest: Digest | null;
  onOpenSlug: (slug: string) => void;
}) {
  const weekly = type === "weekly";
  return (
    <>
      <PageHeader
        eyebrow={weekly ? "WEEKLY EDITOR'S PICKS" : "DAILY AI BRIEFING"}
        title={weekly ? "精品资讯周报" : "AI资讯日报"}
        description={
          weekly
            ? "从一周资讯中筛选真正重要、值得深读并具有持续影响的内容。"
            : "每天汇总最近抓取的重要AI动态，去重并解释它们为什么值得关注。"
        }
      />
      {!digest ? (
        <div className="empty-state">
          <FileText size={30} />
          <h3>还没有生成{weekly ? "周报" : "日报"}</h3>
          <p>
            先在内容管理中抓取资讯，再生成{weekly ? "周报" : "日报"}
            。页面不会再用演示内容冒充最新内容。
          </p>
        </div>
      ) : (
        <article className="brief-page-card">
          <div
            className={`brief-cover ${weekly ? "weekly-cover" : "daily-cover"}`}
          >
            <div>
              <span>
                {formatDate(digest.period_start)} —{" "}
                {formatDate(digest.period_end)}
              </span>
              <h2>{digest.title}</h2>
              <p>{digest.intro}</p>
            </div>
            <div className="brief-number">
              {weekly ? "07" : "01"}
              <small>{weekly ? "WEEK" : "DAY"}</small>
            </div>
          </div>
          <div className="brief-highlights">
            {digest.highlights.map((item, index) => (
              <div className="highlight-item" key={`${item.title}-${index}`}>
                <span className="highlight-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                  {weekly && item.analysis && (
                    <div className="weekly-analysis">
                      <strong>
                        <Languages size={15} /> 中文解读
                      </strong>
                      <p>{item.analysis}</p>
                      {item.takeaways && item.takeaways.length > 0 && (
                        <ul>
                          {item.takeaways.map((takeaway) => (
                            <li key={takeaway}>{takeaway}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                  {item.article_slug && (
                    <button onClick={() => onOpenSlug(item.article_slug!)}>
                      查看完整资讯 <ArrowRight size={15} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="brief-method">
            <ShieldCheck size={20} />
            <div>
              <strong>{weekly ? "精品筛选原则" : "日报整理原则"}</strong>
              <p>
                {weekly
                  ? "优先官方与高可信来源；合并重复事件；关注影响范围、持续价值与可行动性，而非单纯热度。"
                  : "优先官方来源；合并重复报道；AI负责中文摘要与影响解释，重要结论保留原始链接。"}
              </p>
            </div>
          </div>
        </article>
      )}
    </>
  );
}

function AskPage({
  usingDemo,
  articles,
}: {
  usingDemo: boolean;
  articles: Article[];
}) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<Article[]>([]);
  const [asking, setAsking] = useState(false);
  const suggestions = [
    "RAG和长上下文应该怎么选？",
    "最近的AI动态会影响哪些工作流？",
    "如何用AI分析访谈笔录？",
  ];

  async function submit(value = question) {
    const current = value.trim();
    if (!current) return;
    setQuestion(current);
    setAsking(true);
    setAnswer("");
    try {
      if (usingDemo) {
        const matched = articles
          .filter((article) =>
            `${article.title}${article.summary}${article.content}`.includes(
              current.slice(0, 2),
            ),
          )
          .slice(0, 3);
        const fallback = matched.length ? matched : articles.slice(0, 3);
        setSources(fallback);
        setAnswer(
          `这是演示模式下基于AI知识库和资讯库的回答。围绕“${current}”，建议先明确目标、资料范围、输出格式和核验标准。相关内容已列在下方；正式部署后，Workers AI会基于D1检索结果生成带来源的回答。`,
        );
      } else {
        const data = await api.ask(current);
        setAnswer(data.answer);
        setSources(data.sources);
      }
    } catch (error) {
      setAnswer(
        error instanceof Error ? error.message : "暂时无法回答，请稍后重试。",
      );
    } finally {
      setAsking(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="ASK THE KNOWLEDGE BASE"
        title="基于知识与资讯提问"
        description="同时检索长期知识和最新资讯，并展示相关来源，而不是脱离资料自由发挥。"
      />
      <section className="ask-panel">
        <div className="ask-intro">
          <div className="ask-avatar">
            <Bot size={25} />
          </div>
          <div>
            <strong>AI知识助手</strong>
            <span>基于知识库 + 资讯库回答</span>
          </div>
        </div>
        <div className="suggestions">
          {suggestions.map((item) => (
            <button key={item} onClick={() => submit(item)}>
              {item}
            </button>
          ))}
        </div>
        <div className="ask-input">
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="输入你的问题，例如：如何判断一个AI工具是否值得付费？"
            rows={4}
          />
          <button
            disabled={asking || !question.trim()}
            onClick={() => submit()}
          >
            {asking ? (
              <RefreshCw size={18} className="spin" />
            ) : (
              <Sparkles size={18} />
            )}{" "}
            {asking ? "正在检索" : "开始提问"}
          </button>
        </div>
      </section>
      {(answer || asking) && (
        <section className="answer-panel">
          <div className="answer-head">
            <Bot size={19} />
            <strong>回答</strong>
          </div>
          {asking ? (
            <div className="answer-loading">
              <span />
              <span />
              <span />
            </div>
          ) : (
            <p>{answer}</p>
          )}
          {sources.length > 0 && (
            <div className="source-list">
              <span>参考内容</span>
              {sources.map((source) => (
                <div key={source.id}>
                  <BookOpen size={15} />
                  <div>
                    <strong>{source.title}</strong>
                    <small>
                      {source.content_type === "knowledge"
                        ? "知识库"
                        : "资讯库"}{" "}
                      · {source.category_name} · {formatDate(source.updated_at)}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </>
  );
}

function AdminPage({
  usingDemo,
  onDigestGenerated,
}: {
  usingDemo: boolean;
  onDigestGenerated: (type: DigestType) => Promise<void>;
}) {
  const [token, setToken] = useState(
    () => localStorage.getItem("ai-compass-admin-token") || "",
  );
  const [sources, setSources] = useState<Source[]>([]);
  const [knowledgeOverview, setKnowledgeOverview] =
    useState<KnowledgeOverview | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ name: "", feed_url: "", site_url: "" });

  async function loadSources() {
    if (usingDemo) {
      setSources([
        {
          id: 1,
          name: "OpenAI News",
          feed_url: "https://openai.com/news/rss.xml",
          site_url: "https://openai.com/news/",
          source_type: "rss",
          trust_level: 5,
          active: 1,
          last_checked_at: null,
          last_success_at: null,
          last_error: null,
        },
        {
          id: 2,
          name: "Cloudflare Blog",
          feed_url: "https://blog.cloudflare.com/rss/",
          site_url: "https://blog.cloudflare.com/",
          source_type: "rss",
          trust_level: 5,
          active: 1,
          last_checked_at: null,
          last_success_at: null,
          last_error: null,
        },
      ]);
      setKnowledgeOverview({
        total: 62,
        glossary: 47,
        deep_dive: 7,
        guide: 6,
        case_study: 2,
        editorial: 15,
        markdown: 15,
        latest_update: new Date().toISOString(),
      });
      setMessage(
        "当前为演示模式。完成D1迁移并配置ADMIN_TOKEN后，可真实管理来源。",
      );
      return;
    }
    if (!token) return setMessage("请输入ADMIN_TOKEN。");
    setLoading(true);
    try {
      localStorage.setItem("ai-compass-admin-token", token);
      const [sourceData, overviewData] = await Promise.all([
        api.sources(token),
        api.knowledgeOverview(token),
      ]);
      setSources(sourceData.sources);
      setKnowledgeOverview(overviewData.overview);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "读取失败");
    } finally {
      setLoading(false);
    }
  }

  async function addSource() {
    if (!form.name || !form.feed_url)
      return setMessage("请填写来源名称和Feed地址。");
    setLoading(true);
    try {
      await api.addSource(token, {
        ...form,
        source_type: "rss",
        trust_level: 4,
        active: 1,
      });
      setForm({ name: "", feed_url: "", site_url: "" });
      setFormOpen(false);
      await loadSources();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "添加失败");
    } finally {
      setLoading(false);
    }
  }

  async function scan() {
    if (usingDemo) return setMessage("演示模式不会发起真实抓取任务。");
    setLoading(true);
    try {
      const data = await api.scan(token);
      setMessage(`已将 ${data.queued} 个来源加入处理队列。`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "触发失败");
    } finally {
      setLoading(false);
    }
  }

  async function generateDigest(type: DigestType) {
    if (usingDemo)
      return setMessage(
        `演示模式不会真实生成${type === "daily" ? "日报" : "周报"}。`,
      );
    setLoading(true);
    try {
      const data = await api.generateDigest(token, type);
      if (data.created) {
        await onDigestGenerated(type);
        setMessage(
          `${type === "daily" ? "资讯日报" : "精品周报"}已生成并刷新，共纳入 ${data.count ?? 0} 条资讯。`,
        );
      } else {
        setMessage(
          `未生成：${data.reason === "no_articles" ? "最近没有可用的新资讯" : data.reason || "暂无可用资讯"}`,
        );
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "生成失败");
    } finally {
      setLoading(false);
    }
  }

  async function retranslate() {
    if (usingDemo) return setMessage("演示模式不会重新翻译资讯。");
    setLoading(true);
    try {
      const data = await api.retranslate(token);
      setMessage(
        `已将 ${data.queued} 条中文正文不完整的资讯加入重处理队列，请等待3—10分钟后刷新资讯库。`,
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "翻译任务触发失败");
    } finally {
      setLoading(false);
    }
  }

  async function repairWeeklyChinese() {
    if (usingDemo) return setMessage("演示模式不会修复周报中文内容。");
    setLoading(true);
    try {
      const data = await api.repairWeeklyChinese(token);
      setMessage(
        `已将周报关联的 ${data.queued} 条资讯加入中文重处理队列。请等待3—10分钟，再点击“生成周报”。`,
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "周报中文修复任务触发失败",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="CONTENT OPERATIONS"
        title="内容管理"
        description="维护权威RSS/Atom来源、手动触发抓取，并立即生成资讯日报或精品周报。抓取内容进入资讯库，知识库内容单独沉淀。"
      />
      <section className="admin-auth">
        <label>
          <span>管理员令牌</span>
          <input
            type="password"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            placeholder="输入ADMIN_TOKEN"
          />
        </label>
        <button onClick={loadSources} disabled={loading}>
          {loading ? (
            <RefreshCw size={17} className="spin" />
          ) : (
            <ShieldCheck size={17} />
          )}{" "}
          验证并加载
        </button>
      </section>
      {message && <div className="notice">{message}</div>}
      {knowledgeOverview && (
        <section className="knowledge-overview">
          <div className="knowledge-overview-head">
            <div>
              <BookOpen size={19} />
              <strong>知识库概览</strong>
            </div>
            {knowledgeOverview.latest_update && (
              <span>
                最近更新：
                {formatDate(knowledgeOverview.latest_update)}
              </span>
            )}
          </div>
          <div className="knowledge-overview-grid">
            <div className="ko-card ko-total">
              <strong>{knowledgeOverview.total}</strong>
              <span>知识总数</span>
            </div>
            <div className="ko-card">
              <strong>{knowledgeOverview.glossary}</strong>
              <span>基础词条</span>
            </div>
            <div className="ko-card">
              <strong>{knowledgeOverview.deep_dive}</strong>
              <span>深度知识</span>
            </div>
            <div className="ko-card">
              <strong>{knowledgeOverview.guide}</strong>
              <span>实践手册</span>
            </div>
            <div className="ko-card">
              <strong>{knowledgeOverview.case_study}</strong>
              <span>完整案例</span>
            </div>
            <div className="ko-card ko-review">
              <strong>{knowledgeOverview.editorial}</strong>
              <span>编辑整理（待人工审）</span>
            </div>
            <div className="ko-card">
              <strong>{knowledgeOverview.markdown}</strong>
              <span>Markdown深度文</span>
            </div>
          </div>
        </section>
      )}
      <div className="admin-actions">
        <button className="primary-button" onClick={scan} disabled={loading}>
          <RefreshCw size={17} /> 立即检查全部来源
        </button>
        <button
          className="ghost-button"
          onClick={() => generateDigest("daily")}
          disabled={loading}
        >
          <FileText size={17} /> 生成日报
        </button>
        <button
          className="ghost-button"
          onClick={() => generateDigest("weekly")}
          disabled={loading}
        >
          <Sparkles size={17} /> 生成周报
        </button>
        <button
          className="ghost-button"
          onClick={retranslate}
          disabled={loading}
        >
          <Languages size={17} /> 修复资讯库中文正文
        </button>
        <button
          className="ghost-button"
          onClick={repairWeeklyChinese}
          disabled={loading}
        >
          <Sparkles size={17} /> 修复周报中文解读
        </button>
        <button
          className="ghost-button"
          onClick={() => setFormOpen(!formOpen)}
          disabled={loading}
        >
          <Plus size={17} /> 添加RSS来源
        </button>
      </div>
      {formOpen && (
        <section className="source-form">
          <label>
            来源名称
            <input
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
              placeholder="例如：OpenAI News"
            />
          </label>
          <label>
            RSS / Atom地址
            <input
              value={form.feed_url}
              onChange={(event) =>
                setForm({ ...form, feed_url: event.target.value })
              }
              placeholder="https://example.com/rss.xml"
            />
          </label>
          <label>
            官网地址
            <input
              value={form.site_url}
              onChange={(event) =>
                setForm({ ...form, site_url: event.target.value })
              }
              placeholder="https://example.com"
            />
          </label>
          <button onClick={addSource} disabled={loading}>
            保存来源
          </button>
        </section>
      )}
      <section className="source-table-wrap">
        <div className="source-table-head">
          <div>
            <Rss size={19} />
            <strong>资讯来源</strong>
          </div>
          <span>{sources.length} 个</span>
        </div>
        {sources.length ? (
          <div className="source-table">
            {sources.map((source) => (
              <div className="source-row" key={source.id}>
                <div className="source-main">
                  <span
                    className={
                      source.active ? "source-dot active" : "source-dot"
                    }
                  />
                  <div>
                    <strong>{source.name}</strong>
                    <small>{source.feed_url}</small>
                  </div>
                </div>
                <span className="trust-badge">
                  可信度 {source.trust_level}/5
                </span>
                <span>
                  {source.last_success_at
                    ? formatDate(source.last_success_at)
                    : "尚未运行"}
                </span>
                <span
                  className={source.last_error ? "error-text" : "success-text"}
                >
                  {source.last_error ? "异常" : "正常"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state compact">
            <Rss size={24} />
            <p>验证令牌后加载来源列表。</p>
          </div>
        )}
      </section>
    </>
  );
}

function ArticlePage({
  article,
  related,
  prev,
  next,
  onBack,
  onOpenArticle,
}: {
  article: Article;
  related: Article[];
  prev: Article | null;
  next: Article | null;
  onBack: () => void;
  onOpenArticle: (article: Article, back?: View) => void;
}) {
  const isKnowledge = article.content_type === "knowledge";
  useEffect(() => {
    document.title = `${article.title} - AI Compass`;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute(
      "content",
      `${article.summary.slice(0, 140)}${article.summary.length > 140 ? "…" : ""}`,
    );
    return () => {
      document.title = "AI Compass · AI知识库与资讯平台";
    };
  }, [article.title, article.summary]);

  return (
    <article className="article-page">
      <button className="back-link" onClick={onBack}>
        <ChevronLeft size={18} /> 返回{isKnowledge ? "AI知识库" : "资讯库"}
      </button>
      {isKnowledge ? (
        <KnowledgeArticle
          article={article}
          related={related}
          prev={prev}
          next={next}
          onOpenArticle={onOpenArticle}
        />
      ) : (
        <NewsArticle article={article} />
      )}
    </article>
  );
}

function KnowledgeArticle({
  article,
  related,
  prev,
  next,
  onOpenArticle,
}: {
  article: Article;
  related: Article[];
  prev: Article | null;
  next: Article | null;
  onOpenArticle: (article: Article, back?: View) => void;
}) {
  const level = article.knowledge_level
    ? knowledgeLevelMeta[article.knowledge_level]
    : knowledgeLevelMeta.glossary;
  const difficulty = article.difficulty
    ? difficultyMeta[article.difficulty]
    : "入门";
  const isMarkdown = article.content_format === "markdown";
  const headings = useMemo(
    () => (isMarkdown ? extractHeadings(article.content) : []),
    [article.content, isMarkdown],
  );
  const [tocOpen, setTocOpen] = useState(false);

  // 页面刷新后根据 URL hash 定位到对应标题
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    const id = decodeURIComponent(hash.slice(1));
    const timer = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [article.slug]);

  function scrollToHeading(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    history.replaceState(null, "", `#${id}`);
    setTocOpen(false);
  }

  return (
    <div className="knowledge-article">
      <ReadingProgress />
      <div className="article-layout">
        <div className="article-main">
          <div className="article-page-header">
            <div className="article-meta">
              <span>
                知识 · {article.category_name}
                {level && ` · ${level.label}`}
              </span>
              <small>
                <Clock3 size={13} /> 阅读约{article.reading_minutes}分钟
              </small>
            </div>
            <h1>{article.title}</h1>
            <p className="article-summary">{article.summary}</p>
            <div className="article-byline">
              <span>最近更新：{formatDate(article.updated_at)}</span>
              {article.difficulty && (
                <span className={`difficulty-badge difficulty-${article.difficulty}`}>
                  难度：{difficulty}
                </span>
              )}
              {article.audience && article.audience.length > 0 && (
                <span>
                  <Users size={13} /> 适合：{article.audience.join(" / ")}
                </span>
              )}
              <span className={`review-badge review-${article.review_status || "published"}`}>
                {article.review_status === "editorial"
                  ? "AI Compass 编辑整理"
                  : "已发布"}
              </span>
            </div>
          </div>

          {article.why_it_matters && (
            <div className="why-card">
              <Sparkles size={20} />
              <div>
                <strong>核心理解</strong>
                <p>{article.why_it_matters}</p>
              </div>
            </div>
          )}

          {headings.length > 1 && (
            <div className="toc-mobile">
              <button
                onClick={() => setTocOpen(!tocOpen)}
                aria-expanded={tocOpen}
              >
                <List size={16} /> 本文目录
                <ChevronRight
                  size={15}
                  className={tocOpen ? "rotated" : ""}
                />
              </button>
              {tocOpen && (
                <ArticleToc headings={headings} onJump={scrollToHeading} />
              )}
            </div>
          )}

          {isMarkdown ? (
            <MarkdownContent content={article.content} />
          ) : (
            <div className="article-body">
              {article.content
                .split(/\n\s*\n/)
                .filter(Boolean)
                .map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
            </div>
          )}

          {article.references && article.references.length > 0 && (
            <ReferenceList references={article.references} />
          )}

          <div className="article-source">
            <div>
              <ShieldCheck size={18} />
              <span>
                <strong>来源</strong>
                <small>{article.source_name}</small>
              </span>
            </div>
            {article.source_url !== "#" && (
              <a href={article.source_url} target="_blank" rel="noreferrer">
                查看原文 <ExternalLink size={15} />
              </a>
            )}
          </div>
          <div className="tag-row large">
            {article.tags.map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>

          {(prev || next) && (
            <div className="prev-next">
              {prev ? (
                <button
                  className="prev-next-card"
                  onClick={() => onOpenArticle(prev, "knowledge")}
                >
                  <span>
                    <ChevronLeft size={14} /> 上一篇
                  </span>
                  <strong>{prev.title}</strong>
                </button>
              ) : (
                <span />
              )}
              {next ? (
                <button
                  className="prev-next-card next"
                  onClick={() => onOpenArticle(next, "knowledge")}
                >
                  <span>
                    下一篇 <ChevronRight size={14} />
                  </span>
                  <strong>{next.title}</strong>
                </button>
              ) : (
                <span />
              )}
            </div>
          )}

          {related.length > 0 && (
            <section className="related-section">
              <h2>继续阅读</h2>
              <div className="related-grid">
                {related.map((item) => (
                  <button
                    key={item.slug}
                    className="related-card"
                    onClick={() => onOpenArticle(item, "knowledge")}
                  >
                    <span>
                      {item.category_name}
                      {item.knowledge_level &&
                        ` · ${knowledgeLevelMeta[item.knowledge_level].label}`}
                    </span>
                    <strong>{item.title}</strong>
                    <small>约{item.reading_minutes}分钟</small>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
        {headings.length > 1 && (
          <aside className="article-toc-aside">
            <div className="toc-sticky">
              <div className="toc-title">本文目录</div>
              <ArticleToc headings={headings} onJump={scrollToHeading} />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

function ArticleToc({
  headings,
  onJump,
}: {
  headings: Array<{ id: string; text: string; level: number }>;
  onJump: (id: string) => void;
}) {
  return (
    <nav className="article-toc" aria-label="本文目录">
      {headings.map((heading) => (
        <button
          key={heading.id}
          className={heading.level === 3 ? "toc-h3" : ""}
          onClick={() => onJump(heading.id)}
        >
          {heading.text}
        </button>
      ))}
    </nav>
  );
}

function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const total =
        document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? Math.min(1, window.scrollY / total) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div
      className="reading-progress"
      aria-hidden="true"
      style={{ width: `${Math.round(progress * 100)}%` }}
    />
  );
}

/** 在 AST 阶段为 H2/H3 生成稳定锚点 ID（纯函数，StrictMode 双渲染结果一致）。 */
function remarkHeadingIds() {
  const seen = new Map<string, number>();
  return (tree: Root) => {
    visit(tree, "heading", (node) => {
      if (node.depth < 2 || node.depth > 3) return;
      const text = node.children
        .map((child) => ("value" in child ? String(child.value) : ""))
        .join("");
      if (!text.trim()) return;
      // mdast-util-to-hast 会把 data.hProperties 合并进 hast 节点的属性。
      const heading = node as unknown as {
        data?: { hProperties?: Record<string, string> };
      };
      heading.data = heading.data ?? {};
      heading.data.hProperties = heading.data.hProperties ?? {};
      heading.data.hProperties.id = headingIdFor(text.trim(), seen);
    });
  };
}

function headingIdFromNode(node: unknown) {
  // 插件写入 mdast 的 data.hProperties，经 mdast-util-to-hast 消费后出现在 hast 的 properties 上。
  return (node as { properties?: { id?: string } })?.properties?.id;
}

function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkHeadingIds]}
        components={{
          h2: ({ node, children }) => (
            <h2 id={headingIdFromNode(node)}>{children}</h2>
          ),
          h3: ({ node, children }) => (
            <h3 id={headingIdFromNode(node)}>{children}</h3>
          ),
          a: ({ href, children }) => {
            const external =
              href &&
              /^https?:\/\//.test(href) &&
              !href.startsWith(window.location.origin);
            return external ? (
              <a
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                className="external-link"
              >
                {children} <ExternalLink size={12} />
              </a>
            ) : (
              <a href={href}>{children}</a>
            );
          },
          table: ({ children }) => (
            <div className="md-table-wrap">
              <table>{children}</table>
            </div>
          ),
          code: ({ className, children }) => (
            <code className={className}>{children}</code>
          ),
          pre: ({ children }) => <CopyCodeBlock>{children}</CopyCodeBlock>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function textFromChildren(node: ReactNode): string {
  if (node == null) return "";
  if (typeof node === "string" || typeof node === "number")
    return String(node);
  if (Array.isArray(node)) return node.map(textFromChildren).join("");
  if (typeof node === "object" && "props" in node) {
    const element = node as ReactElement<{ children?: ReactNode }>;
    return textFromChildren(element.props.children);
  }
  return "";
}

function CopyCodeBlock({ children }: { children: ReactNode }) {
  const [copied, setCopied] = useState(false);
  const codeNode = Array.isArray(children) ? children[0] : children;
  const className =
    (codeNode as ReactElement<{ className?: string }>)?.props?.className ||
    "";
  const language = /language-([\w-]+)/.exec(className)?.[1] || "";
  const codeText = textFromChildren(
    (codeNode as ReactElement<{ children?: ReactNode }>)?.props?.children,
  );
  const isPrompt = language === "prompt" || /^【.*】/.test(codeText);

  async function copy() {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // 剪贴板不可用时静默失败，不打断阅读。
    }
  }

  return (
    <div className="code-block">
      <div className="code-block-head">
        <span>{isPrompt ? "Prompt 模板" : language || "代码"}</span>
        <button
          onClick={copy}
          aria-label={isPrompt ? "复制Prompt" : "复制代码"}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "已复制" : isPrompt ? "复制Prompt" : "复制"}
        </button>
      </div>
      <pre>{children}</pre>
    </div>
  );
}

function ReferenceList({
  references,
}: {
  references: Array<{
    title: string;
    publisher: string;
    url: string;
    type?: string;
    official?: boolean;
  }>;
}) {
  return (
    <section className="reference-section">
      <h2>参考资料</h2>
      <ol className="reference-list">
        {references.map((reference, index) => (
          <li key={`${reference.url}-${index}`}>
            <div>
              <span className="reference-index">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <strong>{reference.title}</strong>
                <small>
                  {reference.publisher}
                  {reference.official && (
                    <em className="reference-official">官方来源</em>
                  )}
                </small>
              </div>
            </div>
            {reference.url && (
              <a href={reference.url} target="_blank" rel="noreferrer">
                访问 <ExternalLink size={13} />
              </a>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

function NewsArticle({ article }: { article: Article }) {
  const chineseReady =
    article.source_language === "zh" ||
    hasMeaningfulChinese(article.content, 30);
  const translationPending =
    article.source_language !== "zh" && !chineseReady;
  const hasOriginal =
    chineseReady &&
    Boolean(article.original_content) &&
    (article.original_content !== article.content ||
      article.original_title !== article.title);
  const [showOriginal, setShowOriginal] = useState(false);

  useEffect(() => setShowOriginal(false), [article.id]);

  const visibleContent =
    showOriginal && article.original_content
      ? article.original_content
      : translationPending
        ? article.original_content || article.content
        : article.content;
  const paragraphs = useMemo(
    () => visibleContent.split(/\n\s*\n/).filter(Boolean),
    [visibleContent],
  );
  return (
    <>
      <div className="article-page-header">
        <div className="article-meta">
          <span>
            资讯 · {article.category_name}
            {article.source_language && article.source_language !== "zh"
              ? chineseReady
                ? " · AI中文解读"
                : " · 中文翻译处理中"
              : ""}
          </span>
          <small>
            <Clock3 size={13} /> {article.reading_minutes}分钟
          </small>
        </div>
        <h1>
          {showOriginal && article.original_title
            ? article.original_title
            : translationPending && article.original_title
              ? article.original_title
              : article.title}
        </h1>
        {!showOriginal && hasOriginal && article.original_title && (
          <p className="original-title">原文标题：{article.original_title}</p>
        )}
        {!showOriginal && <p>{article.summary}</p>}
        <div className="article-byline">
          <span>发布于 {formatDate(article.updated_at)}</span>
          <span className={`confidence ${article.confidence}`}>
            可信度：
            {article.confidence === "high"
              ? "高"
              : article.confidence === "medium"
                ? "中"
                : "低"}
          </span>
        </div>
      </div>
      {translationPending && (
        <div className="why-card translation-pending">
          <Languages size={20} />
          <div>
            <strong>中文解读正在生成</strong>
            <p>当前先显示原文摘录。管理员可在内容管理中点击“修复资讯库中文正文”，处理完成后刷新本页。</p>
          </div>
        </div>
      )}
      {hasOriginal && (
        <div className="language-switch">
          <button
            className={!showOriginal ? "active" : ""}
            onClick={() => setShowOriginal(false)}
          >
            <Languages size={16} /> 中文解读
          </button>
          <button
            className={showOriginal ? "active" : ""}
            onClick={() => setShowOriginal(true)}
          >
            原文摘录
          </button>
        </div>
      )}
      {!showOriginal && (
        <div className="why-card">
          <Sparkles size={20} />
          <div>
            <strong>为什么值得关注</strong>
            <p>{article.why_it_matters}</p>
          </div>
        </div>
      )}
      <div className="article-body">
        {paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
      <div className="article-source">
        <div>
          <ShieldCheck size={18} />
          <span>
            <strong>来源</strong>
            <small>{article.source_name}</small>
          </span>
        </div>
        {article.source_url !== "#" && (
          <a href={article.source_url} target="_blank" rel="noreferrer">
            查看原文 <ExternalLink size={15} />
          </a>
        )}
      </div>
      <div className="tag-row large">
        {article.tags.map((tag) => (
          <span key={tag}>#{tag}</span>
        ))}
      </div>
    </>
  );
}

function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <header className="page-header">
      <span>{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  );
}
