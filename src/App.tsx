import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Bot,
  ChevronLeft,
  Clock3,
  Compass,
  Database,
  ExternalLink,
  FileText,
  Home,
  Library,
  Languages,
  Menu,
  Plus,
  RefreshCw,
  Rss,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { api } from "./api";
import type { Article, Category, ContentType, Dashboard, Digest, DigestType, Source } from "./types";

type View = "home" | "knowledge" | "daily" | "weekly" | "news" | "ask" | "admin" | "article";

const demoCategories: Category[] = [
  { id: 1, slug: "basics", name: "基础概念", description: "用通俗语言理解模型、Token、上下文与推理。", article_count: 2 },
  { id: 2, slug: "products", name: "模型与产品", description: "理解主流模型、工具与产品能力变化。", article_count: 1 },
  { id: 3, slug: "practice", name: "应用实践", description: "从提示词到可复用工作流的实操指南。", article_count: 1 },
  { id: 4, slug: "research", name: "研究与咨询", description: "访谈、编码、洞察与报告生产的AI方法。", article_count: 1 },
];

const demoKnowledge: Article[] = [
  {
    id: 1,
    slug: "what-is-context-window",
    title: "什么是上下文窗口？它为什么影响AI回答质量",
    summary: "上下文窗口决定模型一次能够读取和处理多少信息，但窗口更长并不自动等于理解更准确。",
    why_it_matters: "选择模型和设计工作流时，需要同时考虑长度、检索方式、信息密度和成本。",
    content: "上下文窗口可以理解为模型一次对话中能够看到的工作记忆。它通常以 Token 计算，包含用户问题、历史消息、系统指令以及模型生成内容。\n\n更长的上下文适合处理长文档和多轮任务，但仍可能出现信息遗漏、注意力分散与成本上升。实际产品通常会把全文检索、摘要、分段处理和长上下文结合起来。",
    source_name: "AI Compass 编辑部",
    source_url: "#",
    published_at: "2026-07-09T08:00:00Z",
    updated_at: "2026-07-10T08:00:00Z",
    category_slug: "basics",
    category_name: "基础概念",
    tags: ["大模型", "上下文", "Token"],
    reading_minutes: 4,
    confidence: "high",
    content_type: "knowledge",
  },
  {
    id: 2,
    slug: "rag-vs-long-context",
    title: "RAG与直接塞入长文本，有什么本质区别？",
    summary: "RAG先检索相关片段再交给模型，长上下文则把更多材料一次性提供给模型，两者适合不同任务。",
    why_it_matters: "知识库问答通常更适合以检索为主、长上下文为辅，兼顾可追溯性与成本。",
    content: "RAG的核心是先从知识库中找到与问题最相关的内容，再让模型基于这些内容回答。它有利于展示来源、更新知识和控制成本。\n\n长上下文更适合材料规模可控、文档之间关系复杂、需要全局理解的任务。成熟系统不会把二者视为二选一，而是根据问题动态选择。",
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
  },
  {
    id: 3,
    slug: "agent-workflow",
    title: "AI Agent不是聊天机器人：从任务拆解到工具调用",
    summary: "Agent的价值在于围绕目标规划步骤、调用工具、读取结果并持续修正，而不仅是生成一段文字。",
    why_it_matters: "理解Agent边界，有助于判断一个产品是真自动化，还是只在普通对话框外套了一层包装。",
    content: "一个典型Agent通常包含目标、状态、工具、循环和停止条件。模型负责判断下一步，外部程序负责真正执行搜索、数据库查询或文件处理。\n\nAgent的主要风险来自错误累积、权限过大、成本失控和缺少确认节点，因此需要日志、预算、重试和人工审核机制。",
    source_name: "AI Compass 编辑部",
    source_url: "#",
    published_at: "2026-07-07T08:00:00Z",
    updated_at: "2026-07-07T08:00:00Z",
    category_slug: "products",
    category_name: "模型与产品",
    tags: ["Agent", "自动化", "工具调用"],
    reading_minutes: 6,
    confidence: "high",
    content_type: "knowledge",
  },
  {
    id: 4,
    slug: "ai-research-workflow",
    title: "研究人员如何把AI嵌入访谈、编码与报告流程",
    summary: "最稳妥的方法不是让AI一次生成整份报告，而是把资料清洗、编码、证据关联和洞察表达拆成可核验环节。",
    why_it_matters: "分阶段工作流能减少幻觉，并保留从结论回到原始证据的路径。",
    content: "研究型AI工作流可以拆分为：材料整理、说话人校正、开放编码、主题聚类、反例检查、洞察提炼和报告表达。\n\n每一步都应输出结构化中间结果，并保留对应原话、样本编号和置信度。AI适合提高效率，研究者仍负责定义问题、判断证据与形成最终观点。",
    source_name: "AI Compass 编辑部",
    source_url: "#",
    published_at: "2026-07-06T08:00:00Z",
    updated_at: "2026-07-06T08:00:00Z",
    category_slug: "research",
    category_name: "研究与咨询",
    tags: ["定性研究", "访谈", "洞察"],
    reading_minutes: 7,
    confidence: "high",
    content_type: "knowledge",
  },
];

const demoNews: Article[] = [
  {
    ...demoKnowledge[1],
    id: 101,
    slug: "demo-news-knowledge-update",
    title: "演示资讯：知识内容与动态资讯已拆分管理",
    summary: "新版同时保留长期有效的AI知识库和自动抓取的资讯库，日报与周报只从动态资讯中生成。",
    why_it_matters: "用户既能系统学习基础知识，也能及时跟踪新变化，避免产品退化为单纯新闻聚合器。",
    content: "这是一条用于演示产品结构的资讯。正式部署后，RSS与Atom抓取内容会自动进入资讯库，而编辑型、长期有效的内容会保存在AI知识库。\n\n资讯日报和精品周报仅使用动态资讯生成，AI问答则可以同时检索知识库和资讯库。",
    source_name: "AI Compass 产品演示",
    source_url: "#",
    content_type: "news",
  },
  {
    ...demoKnowledge[2],
    id: 102,
    slug: "demo-news-pipeline",
    title: "演示资讯：Cron、Queues与失败重试链路已保留",
    summary: "定时任务负责发现新内容，Queues异步完成正文提取、去重、AI摘要、分类、标签和入库。",
    why_it_matters: "抓取和AI处理分离后，单个网站失败不会拖垮整批任务，也便于限制成本与排查问题。",
    content: "这是用于展示后台处理能力的演示资讯。系统每六小时检查一次启用的信息源，发现新条目后写入队列。\n\n队列消费者会读取网页、清洗正文、调用AI整理并写入D1；失败任务按配置重试，超过次数后进入死信队列。",
    source_name: "AI Compass 产品演示",
    source_url: "#",
    content_type: "news",
  },
  {
    ...demoKnowledge[3],
    id: 103,
    slug: "demo-news-daily-weekly",
    title: "演示资讯：日报负责及时，周报负责精品筛选",
    summary: "日报汇总过去24小时变化，周报从一周内容中挑选真正重要、具有持续价值的资讯。",
    why_it_matters: "两种内容满足不同阅读节奏，同时所有原始资讯仍可在资讯库中搜索和回溯。",
    content: "日报适合每天三分钟快速浏览；精品周报适合每周集中阅读。两者都保留对应资讯条目的链接，所有原始条目也会进入资讯库。",
    source_name: "AI Compass 产品演示",
    source_url: "#",
    content_type: "news",
  },
];

const demoDaily: Digest = {
  id: 1,
  brief_type: "daily",
  title: "今日AI资讯日报 · 产品初始化演示版",
  intro: "汇总过去24小时的重要AI动态，去除重复内容，并用简短说明告诉你为什么值得关注。",
  highlights: demoNews.map((item) => ({ title: item.title, summary: item.why_it_matters, article_slug: item.slug })),
  period_start: "2026-07-10T00:00:00Z",
  period_end: "2026-07-11T00:00:00Z",
  published_at: "2026-07-11T00:30:00Z",
};

const demoWeekly: Digest = {
  id: 2,
  brief_type: "weekly",
  title: "本周AI精品资讯 · 值得深读的关键变化",
  intro: "从一周资讯中筛选真正重要、信息密度高且具有持续影响的内容，减少被热点和重复新闻占用时间。",
  highlights: demoNews.map((item) => ({ title: item.title, summary: item.summary, article_slug: item.slug })),
  period_start: "2026-07-04T00:00:00Z",
  period_end: "2026-07-11T00:00:00Z",
  published_at: "2026-07-11T01:00:00Z",
};

const demoDashboard: Dashboard = {
  stats: { knowledge_count: demoKnowledge.length, news_count: demoNews.length, source_count: 3, updated_in_7d: 7, category_count: 4 },
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
  return new Intl.DateTimeFormat("zh-CN", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export default function App() {
  const [view, setView] = useState<View>("home");
  const [dashboard, setDashboard] = useState<Dashboard>(demoDashboard);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [articleBack, setArticleBack] = useState<View>("knowledge");
  const [loading, setLoading] = useState(true);
  const [usingDemo, setUsingDemo] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const allRecent = useMemo(() => [...dashboard.latest_knowledge, ...dashboard.latest_news], [dashboard]);

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
    setArticleBack(back ?? (article.content_type === "news" ? "news" : "knowledge"));
    setView("article");
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (!usingDemo) {
      try {
        const data = await api.article(article.slug);
        setSelectedArticle(data.article);
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
        return openArticle(data.article, data.article.content_type === "news" ? "news" : "knowledge");
      } catch {
        return;
      }
    }
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><Compass size={22} /></div>
          <div><strong>AI Compass</strong><span>知识库 · 日报 · 周报</span></div>
        </div>
        <nav className="side-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = view === item.id || (view === "article" && item.id === articleBack);
            return <button key={item.id} className={active ? "active" : ""} onClick={() => navigate(item.id)}><Icon size={19} /><span>{item.label}</span></button>;
          })}
        </nav>
        <div className="sidebar-card">
          <div className="eyebrow"><Sparkles size={14} /> 持续更新</div>
          <p>系统学习AI知识，每天掌握动态，每周读透真正重要的变化。</p>
          <div className="status-line"><span className="pulse" /> 系统就绪</div>
        </div>
        <p className="sidebar-foot">Cloudflare Workers · D1 · Queues</p>
      </aside>

      {menuOpen && <button className="backdrop" aria-label="关闭菜单" onClick={() => setMenuOpen(false)} />}

      <main className="main-area">
        <header className="topbar">
          <button className="menu-button" onClick={() => setMenuOpen(true)} aria-label="打开菜单"><Menu size={21} /></button>
          <div className="mobile-brand"><Compass size={19} /><strong>AI Compass</strong></div>
          <div className="topbar-actions">
            {usingDemo && <span className="demo-badge">演示模式</span>}
            <button className="icon-button" title="刷新" onClick={() => window.location.reload()}><RefreshCw size={18} /></button>
          </div>
        </header>

        <div className="page-wrap">
          {loading ? <LoadingState /> : (
            <>
              {view === "home" && <HomePage dashboard={dashboard} onNavigate={navigate} onOpenArticle={openArticle} />}
              {view === "knowledge" && <ContentLibraryPage contentType="knowledge" categories={dashboard.categories} initialArticles={dashboard.latest_knowledge} usingDemo={usingDemo} onOpenArticle={(a) => openArticle(a, "knowledge")} />}
              {view === "daily" && <DigestPage type="daily" digest={dashboard.latest_daily} onOpenSlug={openSlug} />}
              {view === "weekly" && <DigestPage type="weekly" digest={dashboard.latest_weekly} onOpenSlug={openSlug} />}
              {view === "news" && <ContentLibraryPage contentType="news" categories={dashboard.categories} initialArticles={dashboard.latest_news} usingDemo={usingDemo} onOpenArticle={(a) => openArticle(a, "news")} />}
              {view === "ask" && <AskPage usingDemo={usingDemo} articles={allRecent} />}
              {view === "admin" && <AdminPage usingDemo={usingDemo} onDigestGenerated={async (type) => { await refreshDigest(type); }} />}
              {view === "article" && selectedArticle && <ArticlePage article={selectedArticle} onBack={() => navigate(articleBack)} />}
            </>
          )}
        </div>
      </main>

      <nav className="bottom-nav">
        {navItems.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const active = view === item.id || (view === "article" && item.id === articleBack);
          return <button key={item.id} className={active ? "active" : ""} onClick={() => navigate(item.id)}><Icon size={20} /><span>{item.label}</span></button>;
        })}
      </nav>
    </div>
  );
}

function LoadingState() {
  return <div className="loading-state"><div className="loading-ring" /><p>正在读取AI知识与最新资讯…</p></div>;
}

function HomePage({ dashboard, onNavigate, onOpenArticle }: { dashboard: Dashboard; onNavigate: (view: View) => void; onOpenArticle: (article: Article, back?: View) => void }) {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="hero-kicker"><Sparkles size={15} /> 学知识、追动态、读重点</span>
          <h1>不只追AI新闻，<br /><em>更建立持续进化的知识体系。</em></h1>
          <p>AI知识库负责系统普及；资讯日报负责及时更新；精品周报负责筛选真正值得深读的变化。</p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => onNavigate("knowledge")}>进入AI知识库 <ArrowRight size={17} /></button>
            <button className="ghost-button" onClick={() => onNavigate("daily")}>阅读今日日报</button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="orb orb-one" /><div className="orb orb-two" />
          <div className="knowledge-map">
            <div className="map-center"><Compass size={28} /><strong>AI知识</strong><span>持续进化</span></div>
            <div className="map-node node-a"><BookOpen size={17} /> 基础概念</div>
            <div className="map-node node-b"><Bot size={17} /> 模型产品</div>
            <div className="map-node node-c"><Database size={17} /> 工作流</div>
            <div className="map-node node-d"><ShieldCheck size={17} /> 治理安全</div>
          </div>
        </div>
      </section>

      <section className="stats-grid">
        <StatCard value={dashboard.stats.knowledge_count} label="知识条目" note="长期沉淀" />
        <StatCard value={dashboard.stats.news_count} label="资讯条目" note="自动归档" />
        <StatCard value={dashboard.stats.source_count} label="权威来源" note="官方优先" />
        <StatCard value={dashboard.stats.updated_in_7d} label="近7日更新" note="保持鲜活" />
      </section>

      <section className="section-block">
        <SectionHeading eyebrow="AI知识体系" title="从基础概念到应用实践，循序理解AI" action="进入知识库" onAction={() => onNavigate("knowledge")} />
        <div className="category-grid">
          {dashboard.categories.map((category, index) => (
            <button key={category.slug} className="category-card" onClick={() => onNavigate("knowledge")}>
              <span className="category-index">0{index + 1}</span>
              <div><h3>{category.name}</h3><p>{category.description}</p></div>
              <div className="category-foot"><span>{category.article_count} 条知识</span><ArrowRight size={17} /></div>
            </button>
          ))}
        </div>
      </section>

      <section className="section-block">
        <SectionHeading eyebrow="精选知识" title="先理解，再判断新变化" action="查看全部知识" onAction={() => onNavigate("knowledge")} />
        <div className="article-grid">
          {dashboard.latest_knowledge.slice(0, 4).map((article) => <ArticleCard key={article.id} article={article} onClick={() => onOpenArticle(article, "knowledge")} />)}
        </div>
      </section>

      <div className="digest-banner-grid">
        {dashboard.latest_daily && <DigestBanner digest={dashboard.latest_daily} type="daily" onClick={() => onNavigate("daily")} />}
        {dashboard.latest_weekly && <DigestBanner digest={dashboard.latest_weekly} type="weekly" onClick={() => onNavigate("weekly")} />}
      </div>

      <section className="section-block">
        <SectionHeading eyebrow="最新资讯" title="抓取、去重、摘要并保留原始出处" action="进入资讯库" onAction={() => onNavigate("news")} />
        {dashboard.latest_news.length ? <div className="article-grid">{dashboard.latest_news.slice(0, 4).map((article) => <ArticleCard key={article.id} article={article} onClick={() => onOpenArticle(article, "news")} />)}</div> : <div className="empty-state compact"><Rss size={24} /><p>部署后启用RSS来源，最新资讯会自动出现在这里。</p></div>}
      </section>
    </>
  );
}

function DigestBanner({ digest, type, onClick }: { digest: Digest; type: DigestType; onClick: () => void }) {
  const weekly = type === "weekly";
  return (
    <section className={`brief-banner ${weekly ? "weekly-banner" : ""}`}>
      <div className="brief-icon">{weekly ? <Sparkles size={25} /> : <FileText size={25} />}</div>
      <div className="brief-banner-copy"><span>{weekly ? "本周精品周报" : "今日资讯日报"} · {formatDate(digest.published_at)}</span><h2>{digest.title}</h2><p>{digest.intro}</p></div>
      <button onClick={onClick}>阅读{weekly ? "周报" : "日报"} <ArrowRight size={17} /></button>
    </section>
  );
}

function StatCard({ value, label, note }: { value: number; label: string; note: string }) {
  return <div className="stat-card"><strong>{value}</strong><div><span>{label}</span><small>{note}</small></div></div>;
}

function SectionHeading({ eyebrow, title, action, onAction }: { eyebrow: string; title: string; action?: string; onAction?: () => void }) {
  return <div className="section-heading"><div><span>{eyebrow}</span><h2>{title}</h2></div>{action && <button onClick={onAction}>{action}<ArrowRight size={16} /></button>}</div>;
}

function ArticleCard({ article, onClick }: { article: Article; onClick: () => void }) {
  const translated = article.content_type === "news" && article.source_language && article.source_language !== "zh";
  return (
    <button className="article-card" onClick={onClick}>
      <div className="article-meta"><span>{article.content_type === "knowledge" ? "知识 · " : "资讯 · "}{article.category_name}{translated ? " · 中文解读" : ""}</span><small><Clock3 size={13} /> {article.reading_minutes}分钟</small></div>
      <h3>{article.title}</h3><p>{article.summary}</p>
      <div className="tag-row">{article.tags.slice(0, 3).map((tag) => <span key={tag}>#{tag}</span>)}</div>
      <div className="article-card-foot"><span>{formatDate(article.updated_at)}</span><ArrowRight size={17} /></div>
    </button>
  );
}

function ContentLibraryPage({ contentType, categories, initialArticles, usingDemo, onOpenArticle }: { contentType: ContentType; categories: Category[]; initialArticles: Article[]; usingDemo: boolean; onOpenArticle: (article: Article) => void }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [articles, setArticles] = useState(initialArticles);
  const [searching, setSearching] = useState(false);
  const isKnowledge = contentType === "knowledge";

  useEffect(() => {
    const handle = window.setTimeout(async () => {
      if (usingDemo) {
        const normalized = query.trim().toLowerCase();
        setArticles(initialArticles.filter((article) => (!category || article.category_slug === category) && (!normalized || `${article.title} ${article.summary} ${article.content} ${article.tags.join(" ")}`.toLowerCase().includes(normalized))));
        return;
      }
      setSearching(true);
      try {
        const data = await api.articles(query, category, contentType);
        setArticles(data.articles);
      } finally {
        setSearching(false);
      }
    }, 280);
    return () => window.clearTimeout(handle);
  }, [query, category, initialArticles, usingDemo, contentType]);

  return (
    <>
      <PageHeader
        eyebrow={isKnowledge ? "AI KNOWLEDGE BASE" : "AI NEWS ARCHIVE"}
        title={isKnowledge ? "AI知识库" : "资讯库"}
        description={isKnowledge ? "系统学习AI基础、模型产品、应用实践与治理安全；支持分类筛选、关键词搜索和来源回溯。" : "保存自动抓取并整理的AI动态；每条资讯保留原文、发布时间、分类、标签和可信度。"}
      />
      <div className="library-toolbar">
        <label className="search-box"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={isKnowledge ? "搜索：RAG、Agent、提示词、访谈分析…" : "搜索：模型发布、产品更新、开源、政策…"} />{query && <button onClick={() => setQuery("")}><X size={16} /></button>}</label>
        <div className="filter-pills"><button className={!category ? "active" : ""} onClick={() => setCategory("")}>全部</button>{categories.map((item) => <button key={item.slug} className={category === item.slug ? "active" : ""} onClick={() => setCategory(item.slug)}>{item.name}</button>)}</div>
      </div>
      <div className="result-line"><span>找到 {articles.length} 条{isKnowledge ? "知识" : "资讯"}</span>{searching && <span><RefreshCw size={14} className="spin" /> 检索中</span>}</div>
      {articles.length ? <div className="article-grid">{articles.map((article) => <ArticleCard key={article.id} article={article} onClick={() => onOpenArticle(article)} />)}</div> : <div className="empty-state"><Search size={28} /><h3>没有找到匹配内容</h3><p>{isKnowledge ? "换一个关键词，或者清除分类筛选。" : "部署后检查资讯源，或换一个关键词搜索。"}</p></div>}
    </>
  );
}

function DigestPage({ type, digest, onOpenSlug }: { type: DigestType; digest: Digest | null; onOpenSlug: (slug: string) => void }) {
  const weekly = type === "weekly";
  return (
    <>
      <PageHeader eyebrow={weekly ? "WEEKLY EDITOR'S PICKS" : "DAILY AI BRIEFING"} title={weekly ? "精品资讯周报" : "AI资讯日报"} description={weekly ? "从一周资讯中筛选真正重要、值得深读并具有持续影响的内容。" : "每天汇总最近抓取的重要AI动态，去重并解释它们为什么值得关注。"} />
      {!digest ? (
        <div className="empty-state"><FileText size={30} /><h3>还没有生成{weekly ? "周报" : "日报"}</h3><p>先在内容管理中抓取资讯，再生成{weekly ? "周报" : "日报"}。页面不会再用演示内容冒充最新内容。</p></div>
      ) : (
        <article className="brief-page-card">
          <div className={`brief-cover ${weekly ? "weekly-cover" : "daily-cover"}`}><div><span>{formatDate(digest.period_start)} — {formatDate(digest.period_end)}</span><h2>{digest.title}</h2><p>{digest.intro}</p></div><div className="brief-number">{weekly ? "07" : "01"}<small>{weekly ? "WEEK" : "DAY"}</small></div></div>
          <div className="brief-highlights">{digest.highlights.map((item, index) => <div className="highlight-item" key={`${item.title}-${index}`}><span className="highlight-number">{String(index + 1).padStart(2, "0")}</span><div><h3>{item.title}</h3><p>{item.summary}</p>{item.article_slug && <button onClick={() => onOpenSlug(item.article_slug!)}>查看完整资讯 <ArrowRight size={15} /></button>}</div></div>)}</div>
          <div className="brief-method"><ShieldCheck size={20} /><div><strong>{weekly ? "精品筛选原则" : "日报整理原则"}</strong><p>{weekly ? "优先官方与高可信来源；合并重复事件；关注影响范围、持续价值与可行动性，而非单纯热度。" : "优先官方来源；合并重复报道；AI负责中文摘要与影响解释，重要结论保留原始链接。"}</p></div></div>
        </article>
      )}
    </>
  );
}

function AskPage({ usingDemo, articles }: { usingDemo: boolean; articles: Article[] }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<Article[]>([]);
  const [asking, setAsking] = useState(false);
  const suggestions = ["RAG和长上下文应该怎么选？", "最近的AI动态会影响哪些工作流？", "如何用AI分析访谈笔录？"];

  async function submit(value = question) {
    const current = value.trim();
    if (!current) return;
    setQuestion(current); setAsking(true); setAnswer("");
    try {
      if (usingDemo) {
        const matched = articles.filter((article) => `${article.title}${article.summary}${article.content}`.includes(current.slice(0, 2))).slice(0, 3);
        const fallback = matched.length ? matched : articles.slice(0, 3);
        setSources(fallback);
        setAnswer(`这是演示模式下基于AI知识库和资讯库的回答。围绕“${current}”，建议先明确目标、资料范围、输出格式和核验标准。相关内容已列在下方；正式部署后，Workers AI会基于D1检索结果生成带来源的回答。`);
      } else {
        const data = await api.ask(current); setAnswer(data.answer); setSources(data.sources);
      }
    } catch (error) { setAnswer(error instanceof Error ? error.message : "暂时无法回答，请稍后重试。"); }
    finally { setAsking(false); }
  }

  return (
    <>
      <PageHeader eyebrow="ASK THE KNOWLEDGE BASE" title="基于知识与资讯提问" description="同时检索长期知识和最新资讯，并展示相关来源，而不是脱离资料自由发挥。" />
      <section className="ask-panel"><div className="ask-intro"><div className="ask-avatar"><Bot size={25} /></div><div><strong>AI知识助手</strong><span>基于知识库 + 资讯库回答</span></div></div><div className="suggestions">{suggestions.map((item) => <button key={item} onClick={() => submit(item)}>{item}</button>)}</div><div className="ask-input"><textarea value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="输入你的问题，例如：如何判断一个AI工具是否值得付费？" rows={4} /><button disabled={asking || !question.trim()} onClick={() => submit()}>{asking ? <RefreshCw size={18} className="spin" /> : <Sparkles size={18} />} {asking ? "正在检索" : "开始提问"}</button></div></section>
      {(answer || asking) && <section className="answer-panel"><div className="answer-head"><Bot size={19} /><strong>回答</strong></div>{asking ? <div className="answer-loading"><span /><span /><span /></div> : <p>{answer}</p>}{sources.length > 0 && <div className="source-list"><span>参考内容</span>{sources.map((source) => <div key={source.id}><BookOpen size={15} /><div><strong>{source.title}</strong><small>{source.content_type === "knowledge" ? "知识库" : "资讯库"} · {source.category_name} · {formatDate(source.updated_at)}</small></div></div>)}</div>}</section>}
    </>
  );
}

function AdminPage({ usingDemo, onDigestGenerated }: { usingDemo: boolean; onDigestGenerated: (type: DigestType) => Promise<void> }) {
  const [token, setToken] = useState(() => localStorage.getItem("ai-compass-admin-token") || "");
  const [sources, setSources] = useState<Source[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ name: "", feed_url: "", site_url: "" });

  async function loadSources() {
    if (usingDemo) { setSources([{ id: 1, name: "OpenAI News", feed_url: "https://openai.com/news/rss.xml", site_url: "https://openai.com/news/", source_type: "rss", trust_level: 5, active: 1, last_checked_at: null, last_success_at: null, last_error: null }, { id: 2, name: "Cloudflare Blog", feed_url: "https://blog.cloudflare.com/rss/", site_url: "https://blog.cloudflare.com/", source_type: "rss", trust_level: 5, active: 1, last_checked_at: null, last_success_at: null, last_error: null }]); setMessage("当前为演示模式。完成D1迁移并配置ADMIN_TOKEN后，可真实管理来源。"); return; }
    if (!token) return setMessage("请输入ADMIN_TOKEN。");
    setLoading(true);
    try { localStorage.setItem("ai-compass-admin-token", token); const data = await api.sources(token); setSources(data.sources); setMessage(""); }
    catch (error) { setMessage(error instanceof Error ? error.message : "读取失败"); }
    finally { setLoading(false); }
  }

  async function addSource() {
    if (!form.name || !form.feed_url) return setMessage("请填写来源名称和Feed地址。");
    setLoading(true);
    try { await api.addSource(token, { ...form, source_type: "rss", trust_level: 4, active: 1 }); setForm({ name: "", feed_url: "", site_url: "" }); setFormOpen(false); await loadSources(); }
    catch (error) { setMessage(error instanceof Error ? error.message : "添加失败"); }
    finally { setLoading(false); }
  }

  async function scan() {
    if (usingDemo) return setMessage("演示模式不会发起真实抓取任务。");
    setLoading(true);
    try { const data = await api.scan(token); setMessage(`已将 ${data.queued} 个来源加入处理队列。`); }
    catch (error) { setMessage(error instanceof Error ? error.message : "触发失败"); }
    finally { setLoading(false); }
  }

  async function generateDigest(type: DigestType) {
    if (usingDemo) return setMessage(`演示模式不会真实生成${type === "daily" ? "日报" : "周报"}。`);
    setLoading(true);
    try {
      const data = await api.generateDigest(token, type);
      if (data.created) {
        await onDigestGenerated(type);
        setMessage(`${type === "daily" ? "资讯日报" : "精品周报"}已生成并刷新，共纳入 ${data.count ?? 0} 条资讯。`);
      } else {
        setMessage(`未生成：${data.reason === "no_articles" ? "最近没有可用的新资讯" : data.reason || "暂无可用资讯"}`);
      }
    } catch (error) { setMessage(error instanceof Error ? error.message : "生成失败"); }
    finally { setLoading(false); }
  }

  async function retranslate() {
    if (usingDemo) return setMessage("演示模式不会重新翻译资讯。");
    setLoading(true);
    try {
      const data = await api.retranslate(token);
      setMessage(`已将 ${data.queued} 条尚未完成中文翻译的资讯加入队列，请等待几分钟后刷新资讯库。`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "翻译任务触发失败"); }
    finally { setLoading(false); }
  }

  return (
    <>
      <PageHeader eyebrow="CONTENT OPERATIONS" title="内容管理" description="维护权威RSS/Atom来源、手动触发抓取，并立即生成资讯日报或精品周报。抓取内容进入资讯库，知识库内容单独沉淀。" />
      <section className="admin-auth"><label><span>管理员令牌</span><input type="password" value={token} onChange={(event) => setToken(event.target.value)} placeholder="输入ADMIN_TOKEN" /></label><button onClick={loadSources} disabled={loading}>{loading ? <RefreshCw size={17} className="spin" /> : <ShieldCheck size={17} />} 验证并加载</button></section>
      {message && <div className="notice">{message}</div>}
      <div className="admin-actions"><button className="primary-button" onClick={scan} disabled={loading}><RefreshCw size={17} /> 立即检查全部来源</button><button className="ghost-button" onClick={() => generateDigest("daily")} disabled={loading}><FileText size={17} /> 生成日报</button><button className="ghost-button" onClick={() => generateDigest("weekly")} disabled={loading}><Sparkles size={17} /> 生成周报</button><button className="ghost-button" onClick={retranslate} disabled={loading}><Languages size={17} /> 修复英文资讯翻译</button><button className="ghost-button" onClick={() => setFormOpen(!formOpen)} disabled={loading}><Plus size={17} /> 添加RSS来源</button></div>
      {formOpen && <section className="source-form"><label>来源名称<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="例如：OpenAI News" /></label><label>RSS / Atom地址<input value={form.feed_url} onChange={(event) => setForm({ ...form, feed_url: event.target.value })} placeholder="https://example.com/rss.xml" /></label><label>官网地址<input value={form.site_url} onChange={(event) => setForm({ ...form, site_url: event.target.value })} placeholder="https://example.com" /></label><button onClick={addSource} disabled={loading}>保存来源</button></section>}
      <section className="source-table-wrap"><div className="source-table-head"><div><Rss size={19} /><strong>资讯来源</strong></div><span>{sources.length} 个</span></div>{sources.length ? <div className="source-table">{sources.map((source) => <div className="source-row" key={source.id}><div className="source-main"><span className={source.active ? "source-dot active" : "source-dot"} /><div><strong>{source.name}</strong><small>{source.feed_url}</small></div></div><span className="trust-badge">可信度 {source.trust_level}/5</span><span>{source.last_success_at ? formatDate(source.last_success_at) : "尚未运行"}</span><span className={source.last_error ? "error-text" : "success-text"}>{source.last_error ? "异常" : "正常"}</span></div>)}</div> : <div className="empty-state compact"><Rss size={24} /><p>验证令牌后加载来源列表。</p></div>}</section>
    </>
  );
}

function ArticlePage({ article, onBack }: { article: Article; onBack: () => void }) {
  const isKnowledge = article.content_type === "knowledge";
  const hasOriginal = !isKnowledge && article.source_language !== "zh" && Boolean(article.original_content);
  const [showOriginal, setShowOriginal] = useState(false);

  useEffect(() => setShowOriginal(false), [article.id]);

  const visibleContent = showOriginal && article.original_content ? article.original_content : article.content;
  const paragraphs = useMemo(() => visibleContent.split(/\n\s*\n/).filter(Boolean), [visibleContent]);
  return (
    <article className="article-page">
      <button className="back-link" onClick={onBack}><ChevronLeft size={18} /> 返回{isKnowledge ? "AI知识库" : "资讯库"}</button>
      <div className="article-page-header">
        <div className="article-meta"><span>{isKnowledge ? "知识" : "资讯"} · {article.category_name}{!isKnowledge && article.source_language && article.source_language !== "zh" ? " · AI中文解读" : ""}</span><small><Clock3 size={13} /> {article.reading_minutes}分钟</small></div>
        <h1>{showOriginal && article.original_title ? article.original_title : article.title}</h1>
        {!showOriginal && hasOriginal && article.original_title && <p className="original-title">原文标题：{article.original_title}</p>}
        {!showOriginal && <p>{article.summary}</p>}
        <div className="article-byline"><span>{isKnowledge ? "更新" : "发布"}于 {formatDate(article.updated_at)}</span><span className={`confidence ${article.confidence}`}>可信度：{article.confidence === "high" ? "高" : article.confidence === "medium" ? "中" : "低"}</span></div>
      </div>
      {!isKnowledge && hasOriginal && <div className="language-switch"><button className={!showOriginal ? "active" : ""} onClick={() => setShowOriginal(false)}><Languages size={16} /> 中文解读</button><button className={showOriginal ? "active" : ""} onClick={() => setShowOriginal(true)}>原文摘录</button></div>}
      {!showOriginal && <div className="why-card"><Sparkles size={20} /><div><strong>{isKnowledge ? "核心理解" : "为什么值得关注"}</strong><p>{article.why_it_matters}</p></div></div>}
      <div className="article-body">{paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
      <div className="article-source"><div><ShieldCheck size={18} /><span><strong>来源</strong><small>{article.source_name}</small></span></div>{article.source_url !== "#" && <a href={article.source_url} target="_blank" rel="noreferrer">查看原文 <ExternalLink size={15} /></a>}</div>
      <div className="tag-row large">{article.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>
    </article>
  );
}

function PageHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <header className="page-header"><span>{eyebrow}</span><h1>{title}</h1><p>{description}</p></header>;
}
