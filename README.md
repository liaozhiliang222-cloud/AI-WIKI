# AI Compass：AI知识库 + 资讯日报 + 精品周报

一个可部署到 Cloudflare Workers 的中文 AI 知识与资讯 PWA。它不是单纯的新闻聚合器，而是把长期知识、最新动态和精选解读放在同一个产品里。

## 完整产品结构

- **首页**：展示知识分类、精选知识、最新资讯、今日日报和本周精品周报。
- **AI知识库**：长期有效的AI基础知识、模型产品、应用实践、研究咨询与治理安全内容；支持分类筛选和关键词搜索。
- **知识详情**：展示正文、核心理解、标签、可信度、更新时间和原始来源。
- **AI资讯日报**：每天汇总过去24小时的重要动态，自动去重并解释影响。
- **精品资讯周报**：每周从高可信来源中筛选5–8条真正值得深读的内容。
- **资讯库**：保存自动抓取资讯的摘要、正文、分类、标签、来源、发布时间和可信度。
- **AI问答**：同时检索AI知识库与资讯库，生成带参考来源的回答。
- **管理后台**：维护RSS/Atom来源、手动抓取、手动生成日报或周报。

三日简报已经移除，不会出现在导航、定时任务和数据结构中。

## 自动处理能力

- RSS / Atom订阅抓取
- 文章指纹去重
- 网页正文提取与清洗
- AI摘要、分类、标签、影响说明和可信度字段
- Cron定时检查资讯源
- Queues异步处理
- 失败重试与死信队列
- Service Worker离线缓存
- 未连接Workers AI时的本地降级模式

## 内容分层

数据库中的内容分为两类：

- `knowledge`：编辑型、长期有效的知识内容；
- `news`：RSS/Atom自动抓取的动态资讯。

日报和周报只从`news`内容中生成；AI问答同时使用两类内容。

## 自动运行时间

Cloudflare Cron 使用 UTC：

- 每6小时检查一次资讯源；
- 每天00:30 UTC生成日报，即北京时间08:30；
- 每周日01:00 UTC生成周报，即北京时间周日09:00。

## 技术架构

- React + Vite响应式PWA
- Cloudflare Workers + Static Assets
- D1数据库
- Queues异步抓取与处理
- Workers AI摘要、分类、日报、周报和知识问答
- Cron Triggers定时运行

## GitHub部署

最简单的方式是把项目文件上传到GitHub，再通过Cloudflare Workers Builds连接仓库部署。详细步骤见`GITHUB_DEPLOY.md`。

## 本地开发

```bash
npm install
npm run db:migrate:local
npm run dev
```

本地管理员令牌：

```text
local-dev-only
```

## 数据库迁移

- `0001_initial.sql`：基础表结构
- `0002_seed.sql`：知识库与资讯源演示数据
- `0003_daily_weekly_digests.sql`：日报与周报类型
- `0004_content_types.sql`：区分AI知识库与资讯库，并补充演示资讯
