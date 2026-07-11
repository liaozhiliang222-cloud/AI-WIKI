import type { Env } from "./types";
import { clampText, parseJsonFromModel } from "./utils";

export type ArticleAIResult = {
  summary: string;
  whyItMatters: string;
  categorySlug: string;
  tags: string[];
  confidence: "high" | "medium" | "low";
};

function modelText(result: unknown): string {
  if (typeof result === "string") return result;
  if (!result || typeof result !== "object") return "";
  const object = result as Record<string, unknown>;
  if (typeof object.response === "string") return object.response;
  if (typeof object.result === "string") return object.result;
  const choices = object.choices as Array<Record<string, unknown>> | undefined;
  const content = (choices?.[0]?.message as Record<string, unknown> | undefined)?.content;
  return typeof content === "string" ? content : "";
}

export async function summarizeArticle(env: Env, input: { title: string; description: string; content: string; sourceName: string }): Promise<ArticleAIResult> {
  const fallback: ArticleAIResult = {
    summary: clampText(input.description || input.content, 220),
    whyItMatters: "这条更新可能影响相关AI工具的能力、使用方式或行业判断，建议结合原始来源进一步核验。",
    categorySlug: inferCategory(`${input.title} ${input.description}`),
    tags: inferTags(`${input.title} ${input.description}`),
    confidence: "medium",
  };

  try {
    const prompt = `你是AI知识库编辑。请基于下列官方或行业来源内容，输出严格JSON，不要使用Markdown。\n\n字段：\nsummary：80-140字中文摘要，只写材料明确支持的事实；\nwhy_it_matters：50-100字，解释对普通AI用户或知识工作者的影响；\ncategory_slug：只能是 basics、products、practice、research、governance 之一；\ntags：2-5个简短中文标签；\nconfidence：high、medium、low之一。\n\n来源：${input.sourceName}\n标题：${input.title}\n已有摘要：${input.description}\n正文：${clampText(input.content, 10000)}`;
    const result = await env.AI.run(env.AI_MODEL as keyof AiModels, {
      messages: [
        { role: "system", content: "坚持事实，不补充材料中没有的信息。输出严格JSON。" },
        { role: "user", content: prompt },
      ],
      max_tokens: 900,
      temperature: 0.2,
    } as never);
    const parsed = parseJsonFromModel(modelText(result));
    return {
      summary: clampText(String(parsed.summary || fallback.summary), 260),
      whyItMatters: clampText(String(parsed.why_it_matters || fallback.whyItMatters), 220),
      categorySlug: ["basics", "products", "practice", "research", "governance"].includes(String(parsed.category_slug)) ? String(parsed.category_slug) : fallback.categorySlug,
      tags: Array.isArray(parsed.tags) ? parsed.tags.map(String).filter(Boolean).slice(0, 5) : fallback.tags,
      confidence: ["high", "medium", "low"].includes(String(parsed.confidence)) ? String(parsed.confidence) as ArticleAIResult["confidence"] : fallback.confidence,
    };
  } catch (error) {
    console.warn("AI summarization fallback", error);
    return fallback;
  }
}

export async function answerWithKnowledge(env: Env, question: string, context: Array<{ title: string; summary: string; content: string; source: string }>) {
  const evidence = context.map((item, index) => `[${index + 1}] ${item.title}\n来源：${item.source}\n摘要：${item.summary}\n正文：${clampText(item.content, 2200)}`).join("\n\n");
  try {
    const result = await env.AI.run(env.AI_MODEL as keyof AiModels, {
      messages: [
        { role: "system", content: "你是严谨的中文AI知识助手。只能依据提供的知识条目回答；无法确认时明确说不知道。回答简洁、可操作，并在关键句后使用[1][2]标注依据。" },
        { role: "user", content: `问题：${question}\n\n知识条目：\n${evidence}` },
      ],
      max_tokens: 1200,
      temperature: 0.2,
    } as never);
    const text = modelText(result).trim();
    if (text) return text;
  } catch (error) {
    console.warn("AI answer fallback", error);
  }
  return context.length
    ? `当前知识库中，与这个问题最相关的内容包括：${context.map((item) => item.title).join("、")}。建议先阅读这些条目，并根据其中的来源进一步核验。`
    : "当前知识库还没有足够资料回答这个问题。";
}

export async function createDigestWithAI(
  env: Env,
  type: "daily" | "weekly",
  articles: Array<{ slug: string; title: string; summary: string; why_it_matters: string; source_name?: string; confidence?: string }>,
) {
  const isWeekly = type === "weekly";
  const fallback = {
    title: isWeekly ? "本周AI精品资讯 · 值得深读的关键变化" : "今日AI资讯日报 · 重要更新速览",
    intro: isWeekly
      ? "从本周资讯中筛选真正重要、具有持续影响的内容，并说明它们为什么值得花时间阅读。"
      : "汇总过去24小时的重要AI动态，去除重复信息，帮助你快速掌握变化。",
    highlights: articles.slice(0, isWeekly ? 8 : 10).map((item) => ({
      title: item.title,
      summary: item.why_it_matters || item.summary,
      article_slug: item.slug,
    })),
  };
  if (!articles.length) return fallback;

  try {
    const role = isWeekly
      ? "你是严谨的AI周刊主编。请从一周资讯中筛选真正重要、信息密度高、具有长期价值的精品内容；合并重复事件，避免把普通产品宣传当成重大突破。"
      : "你是严谨的AI日报主编。请把过去24小时的重要动态整理成快速可读的日报；合并重复事件，优先官方来源，不夸大。";
    const requirements = isWeekly
      ? "输出5-8条精品内容。每条summary用90-180字说明：发生了什么、为什么重要、读者应该关注什么。按重要性排序。"
      : "输出5-10条要点。每条summary用50-100字说明事实和影响，适合3分钟快速阅读。按重要性排序。";
    const result = await env.AI.run(env.AI_MODEL as keyof AiModels, {
      messages: [
        { role: "system", content: `${role} 只能依据给定条目，输出严格JSON，不要使用Markdown。` },
        { role: "user", content: `请生成中文${isWeekly ? "精品资讯周报" : "AI资讯日报"}。输出字段 title、intro、highlights；highlights每项必须包含title、summary、article_slug，并保留给定slug。${requirements}\n\n条目：${JSON.stringify(articles)}` },
      ],
      max_tokens: isWeekly ? 2200 : 1600,
      temperature: 0.2,
    } as never);
    const parsed = parseJsonFromModel(modelText(result));
    return {
      title: clampText(String(parsed.title || fallback.title), 120),
      intro: clampText(String(parsed.intro || fallback.intro), 360),
      highlights: Array.isArray(parsed.highlights)
        ? parsed.highlights.slice(0, isWeekly ? 8 : 10).map((item) => {
            const object = item as Record<string, unknown>;
            return {
              title: clampText(String(object.title || "重点更新"), 140),
              summary: clampText(String(object.summary || ""), isWeekly ? 420 : 260),
              article_slug: String(object.article_slug || ""),
            };
          })
        : fallback.highlights,
    };
  } catch (error) {
    console.warn("AI digest fallback", error);
    return fallback;
  }
}

function inferCategory(text: string) {
  const normalized = text.toLowerCase();
  if (/访谈|调研|研究|咨询|报告|编码/.test(normalized)) return "research";
  if (/安全|治理|法规|版权|隐私|合规/.test(normalized)) return "governance";
  if (/agent|工作流|提示词|自动化|教程|实践/.test(normalized)) return "practice";
  if (/模型|发布|产品|版本|api|工具/.test(normalized)) return "products";
  return "basics";
}

function inferTags(text: string) {
  const candidates = ["大模型", "Agent", "RAG", "多模态", "AI工具", "工作流", "研究", "安全", "开源", "产品更新"];
  const matched = candidates.filter((tag) => text.toLowerCase().includes(tag.toLowerCase()));
  return (matched.length ? matched : ["AI动态", "知识更新"]).slice(0, 4);
}
