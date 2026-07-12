import type { Env } from "./types";
import { clampText, parseJsonFromModel } from "./utils";

export type ArticleAIResult = {
  translatedTitle: string;
  translatedContent: string;
  sourceLanguage: string;
  isAiRelevant: boolean;
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
  const content = (choices?.[0]?.message as Record<string, unknown> | undefined)
    ?.content;
  return typeof content === "string" ? content : "";
}

function chineseStats(text: string) {
  const compact = text.replace(/\s+/g, "");
  const chinese = (compact.match(/[\u3400-\u9fff]/g) || []).length;
  return {
    compactLength: compact.length,
    chinese,
    ratio: compact.length ? chinese / compact.length : 0,
  };
}

function hasMeaningfulChinese(
  text: string,
  options: { minChars?: number; minRatio?: number } = {},
) {
  const { minChars = 12, minRatio = 0.12 } = options;
  const stats = chineseStats(text);
  return stats.chinese >= minChars && stats.ratio >= minRatio;
}

function cleanTranslationOutput(text: string) {
  return text
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/^```(?:json|text|markdown)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .replace(/^(?:中文(?:翻译|译文|解读)|译文|翻译)[:：]\s*/i, "")
    .trim();
}

function translationText(result: unknown): string {
  if (typeof result === "string") return cleanTranslationOutput(result);
  if (!result || typeof result !== "object") return "";
  const object = result as Record<string, unknown>;
  for (const key of ["translated_text", "translation", "response"]) {
    if (typeof object[key] === "string")
      return cleanTranslationOutput(String(object[key]));
  }
  for (const key of ["result", "data", "output"]) {
    const nested = object[key];
    if (nested && typeof nested === "object") {
      const text = translationText(nested);
      if (text) return text;
    }
    if (typeof nested === "string") return cleanTranslationOutput(nested);
  }
  return cleanTranslationOutput(modelText(result));
}

function splitForTranslation(text: string, maxChars = 1350) {
  const normalized = text.replace(/\r/g, "").trim();
  if (!normalized) return [];
  const paragraphs = normalized.split(/\n\s*\n/).filter(Boolean);
  const chunks: string[] = [];
  let current = "";
  for (const paragraph of paragraphs) {
    const pieces =
      paragraph.length > maxChars
        ? paragraph.match(
            new RegExp(`.{1,${maxChars}}(?:[.!?。！？\\n]|$)`, "gs"),
          ) || [paragraph]
        : [paragraph];
    for (const piece of pieces) {
      if (current && current.length + piece.length + 2 > maxChars) {
        chunks.push(current);
        current = piece;
      } else {
        current = current ? `${current}\n\n${piece}` : piece;
      }
    }
  }
  if (current) chunks.push(current);
  return chunks.slice(0, 5);
}

async function translateChunkWithM2M(env: Env, text: string) {
  const attempts = [
    { source_lang: "english", target_lang: "chinese" },
    { source_lang: "en", target_lang: "zh" },
  ];
  for (const languages of attempts) {
    try {
      const result = await env.AI.run(
        "@cf/meta/m2m100-1.2b" as keyof AiModels,
        {
          text,
          ...languages,
        } as never,
      );
      const value = translationText(result);
      if (hasMeaningfulChinese(value, { minChars: 4, minRatio: 0.08 }))
        return value;
    } catch (error) {
      console.warn("M2M translation attempt failed", languages, error);
    }
  }
  return "";
}

async function translateChunkWithChat(env: Env, text: string) {
  const result = await env.AI.run(
    env.AI_MODEL as keyof AiModels,
    {
      messages: [
        {
          role: "system",
          content:
            "你是专业科技翻译。将英文忠实翻译成简体中文，保留产品名、数字和专有名词。只输出中文译文，不要解释，不要JSON，不要Markdown。",
        },
        { role: "user", content: text },
      ],
      max_tokens: 1900,
      temperature: 0.05,
    } as never,
  );
  return cleanTranslationOutput(modelText(result));
}

async function translateEnglishToChinese(env: Env, text: string) {
  const chunks = splitForTranslation(clampText(text, 7000));
  if (!chunks.length) return "";
  const translated: string[] = [];
  for (const chunk of chunks) {
    let value = await translateChunkWithM2M(env, chunk);
    if (!hasMeaningfulChinese(value, { minChars: 6, minRatio: 0.08 })) {
      try {
        value = await translateChunkWithChat(env, chunk);
      } catch (error) {
        console.warn("Chat chunk translation failed", error);
      }
    }
    if (value) translated.push(value);
  }
  return translated.join("\n\n").trim();
}

async function translateWithChatModel(
  env: Env,
  title: string,
  content: string,
) {
  const [translatedTitle, translatedContent] = await Promise.all([
    translateChunkWithChat(env, title),
    translateEnglishToChinese(env, content),
  ]);
  return {
    title: clampText(translatedTitle, 220),
    content: clampText(translatedContent, 7000),
  };
}

function detectLanguage(text: string) {
  const compact = text.replace(/\s+/g, "").slice(0, 1500);
  if (!compact) return "unknown";
  const chinese = (compact.match(/[\u3400-\u9fff]/g) || []).length;
  if (chinese / compact.length >= 0.08) return "zh";
  return "en";
}

function keywordRelevant(text: string) {
  return /\b(ai|artificial intelligence|machine learning|deep learning|llm|large language model|generative ai|agentic|agent|transformer|neural|multimodal|rag|embedding|inference|foundation model|computer vision|robotics)\b|人工智能|大模型|生成式|智能体|机器学习|深度学习|神经网络|多模态|模型训练|模型推理|算力|芯片|机器人|提示词|知识库|向量数据库|具身智能|自动驾驶/i.test(
    text,
  );
}

export async function summarizeArticle(
  env: Env,
  input: {
    title: string;
    description: string;
    content: string;
    sourceName: string;
  },
): Promise<ArticleAIResult> {
  // 语言判断必须以抓取到的原始材料为准，不能让模型返回值覆盖。
  // 之前模型偶尔把英文来源误报为 zh，导致页面出现“中文解读”标签但正文仍是英文。
  const sourceLanguage = detectLanguage(
    `${input.title}\n${input.description}\n${input.content}`,
  );
  const sourceBody = input.content || input.description;
  const fallbackContent = clampText(
    sourceBody,
    sourceLanguage === "zh" ? 5000 : 2600,
  );
  const fallback: ArticleAIResult = {
    translatedTitle: input.title,
    translatedContent: fallbackContent,
    sourceLanguage,
    isAiRelevant: keywordRelevant(
      `${input.sourceName} ${input.title} ${input.description}`,
    ),
    summary: clampText(input.description || input.content, 220),
    whyItMatters:
      "这条更新可能影响相关AI工具的能力、使用方式或行业判断，建议结合原始来源进一步核验。",
    categorySlug: inferCategory(`${input.title} ${input.description}`),
    tags: inferTags(`${input.title} ${input.description}`),
    confidence: "medium",
  };

  try {
    const prompt = `你是中文AI知识与资讯编辑。请基于下列来源材料输出严格JSON，不要使用Markdown，不要补充材料中没有的信息。\n\n字段要求：\nis_ai_relevant：布尔值，只有内容主要讨论AI、机器学习、大模型、机器人、AI芯片、AI治理或AI应用时才为true；\nsource_language：原文主要语言，使用zh、en或other；\ntranslated_title：准确、自然的中文标题；原文已经是中文时只做必要清理；\ntranslated_content：忠实中文解读。英文原文请翻译并压缩为500-1000个中文字符，保留关键事实、数字、产品名与限制，不逐字复制整篇文章；中文原文请整理为500-1000字的清晰正文；\nsummary：80-140字中文摘要；\nwhy_it_matters：50-100字，解释对AI用户、开发者或知识工作者的影响；\ncategory_slug：只能是 basics、products、practice、research、governance 之一；\ntags：2-5个简短中文标签；\nconfidence：high、medium、low之一。\n\n来源：${input.sourceName}\n标题：${input.title}\n已有摘要：${input.description}\n正文：${clampText(input.content, 12000)}`;
    const result = await env.AI.run(
      env.AI_MODEL as keyof AiModels,
      {
        messages: [
          {
            role: "system",
            content:
              "坚持事实、避免夸大。英文内容必须给出中文标题与中文解读。输出严格JSON。",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 2400,
        temperature: 0.12,
      } as never,
    );
    const parsed = parseJsonFromModel(modelText(result));
    let translatedTitle = clampText(
      String(parsed.translated_title || fallback.translatedTitle),
      220,
    );
    let translatedContent = clampText(
      String(parsed.translated_content || fallback.translatedContent),
      6000,
    );
    let summary = clampText(String(parsed.summary || fallback.summary), 260);
    let whyItMatters = clampText(
      String(parsed.why_it_matters || fallback.whyItMatters),
      220,
    );

    if (sourceLanguage !== "zh") {
      const titleReady = hasMeaningfulChinese(translatedTitle, {
        minChars: 3,
        minRatio: 0.08,
      });
      const contentStats = chineseStats(translatedContent);
      const minimumChineseChars = Math.min(
        160,
        Math.max(35, Math.floor(sourceBody.length / 18)),
      );
      const contentReady =
        contentStats.chinese >= minimumChineseChars && contentStats.ratio >= 0.08;

      // 对英文来源执行确定性翻译兜底。即使主模型只返回中文摘要，
      // 也不会再把英文正文误存为“中文解读”。
      if (!titleReady || !contentReady) {
        try {
          const [literalTitle, literalContent] = await Promise.all([
            !titleReady
              ? translateEnglishToChinese(env, input.title)
              : Promise.resolve(""),
            !contentReady
              ? translateEnglishToChinese(env, sourceBody)
              : Promise.resolve(""),
          ]);
          if (
            hasMeaningfulChinese(literalTitle, {
              minChars: 3,
              minRatio: 0.08,
            })
          )
            translatedTitle = clampText(literalTitle, 220);
          if (
            hasMeaningfulChinese(literalContent, {
              minChars: minimumChineseChars,
              minRatio: 0.08,
            })
          )
            translatedContent = clampText(literalContent, 6000);
        } catch (translationError) {
          console.warn("Guaranteed translation fallback failed", translationError);
        }
      }

      // 最后一层使用聊天模型纯文本翻译，不依赖 JSON 解析。
      if (
        !hasMeaningfulChinese(translatedTitle, {
          minChars: 3,
          minRatio: 0.08,
        }) ||
        !hasMeaningfulChinese(translatedContent, {
          minChars: minimumChineseChars,
          minRatio: 0.08,
        })
      ) {
        try {
          const chatTranslation = await translateWithChatModel(
            env,
            input.title,
            sourceBody,
          );
          if (
            hasMeaningfulChinese(chatTranslation.title, {
              minChars: 3,
              minRatio: 0.08,
            })
          )
            translatedTitle = chatTranslation.title;
          if (
            hasMeaningfulChinese(chatTranslation.content, {
              minChars: minimumChineseChars,
              minRatio: 0.08,
            })
          )
            translatedContent = chatTranslation.content;
        } catch (translationError) {
          console.warn("Plain chat translation fallback failed", translationError);
        }
      }

      if (!hasMeaningfulChinese(summary, { minChars: 15, minRatio: 0.08 })) {
        summary = hasMeaningfulChinese(translatedContent, {
          minChars: 20,
          minRatio: 0.08,
        })
          ? clampText(translatedContent, 240)
          : "该资讯的中文摘要仍在处理中，请先查看原文并稍后刷新。";
      }
      if (
        !hasMeaningfulChinese(whyItMatters, { minChars: 12, minRatio: 0.08 })
      ) {
        whyItMatters = fallback.whyItMatters;
      }
    }

    return {
      translatedTitle,
      translatedContent,
      sourceLanguage,
      isAiRelevant:
        typeof parsed.is_ai_relevant === "boolean"
          ? parsed.is_ai_relevant
          : fallback.isAiRelevant,
      summary,
      whyItMatters,
      categorySlug: [
        "basics",
        "products",
        "practice",
        "research",
        "governance",
      ].includes(String(parsed.category_slug))
        ? String(parsed.category_slug)
        : fallback.categorySlug,
      tags: Array.isArray(parsed.tags)
        ? parsed.tags.map(String).filter(Boolean).slice(0, 5)
        : fallback.tags,
      confidence: ["high", "medium", "low"].includes(String(parsed.confidence))
        ? (String(parsed.confidence) as ArticleAIResult["confidence"])
        : fallback.confidence,
    };
  } catch (error) {
    console.warn("AI summarization fallback", error);
    if (sourceLanguage !== "zh") {
      try {
        const [translatedTitle, translatedContent] = await Promise.all([
          translateEnglishToChinese(env, input.title),
          translateEnglishToChinese(env, sourceBody),
        ]);
        return {
          ...fallback,
          translatedTitle:
            translatedTitle || fallback.translatedTitle,
          translatedContent:
            translatedContent || fallback.translatedContent,
          summary: translatedContent
            ? clampText(translatedContent, 220)
            : fallback.summary,
        };
      } catch (translationError) {
        console.warn("Translation-only fallback failed", translationError);
      }
    }
    return fallback;
  }
}

export async function answerWithKnowledge(
  env: Env,
  question: string,
  context: Array<{
    title: string;
    summary: string;
    content: string;
    source: string;
  }>,
) {
  const evidence = context
    .map(
      (item, index) =>
        `[${index + 1}] ${item.title}\n来源：${item.source}\n摘要：${item.summary}\n正文：${clampText(item.content, 2200)}`,
    )
    .join("\n\n");
  try {
    const result = await env.AI.run(
      env.AI_MODEL as keyof AiModels,
      {
        messages: [
          {
            role: "system",
            content:
              "你是严谨的中文AI知识助手。只能依据提供的知识条目回答；无法确认时明确说不知道。回答简洁、可操作，并在关键句后使用[1][2]标注依据。",
          },
          {
            role: "user",
            content: `问题：${question}\n\n知识条目：\n${evidence}`,
          },
        ],
        max_tokens: 1200,
        temperature: 0.2,
      } as never,
    );
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
  articles: Array<{
    slug: string;
    title: string;
    summary: string;
    why_it_matters: string;
    content?: string;
    source_name?: string;
    confidence?: string;
  }>,
) {
  const isWeekly = type === "weekly";
  const fallback = {
    title: isWeekly
      ? "本周AI精品资讯 · 值得深读的关键变化"
      : "今日AI资讯日报 · 重要更新速览",
    intro: isWeekly
      ? "从本周资讯中筛选真正重要、具有持续影响的内容，并说明它们为什么值得花时间阅读。"
      : "汇总过去24小时的重要AI动态，去除重复信息，帮助你快速掌握变化。",
    highlights: articles.slice(0, isWeekly ? 8 : 10).map((item) => ({
      title:
        hasMeaningfulChinese(item.title, { minChars: 3, minRatio: 0.08 })
          ? item.title
          : `AI资讯重点：${clampText(item.summary || item.why_it_matters, 38)}`,
      summary: item.summary,
      analysis: isWeekly ? item.why_it_matters || item.summary : undefined,
      takeaways: isWeekly
        ? ["理解这项变化的实际影响", "结合原始来源判断适用范围"]
        : undefined,
      article_slug: item.slug,
    })),
  };
  if (!articles.length) return fallback;

  try {
    const role = isWeekly
      ? "你是严谨的AI周刊主编。请从一周资讯中筛选真正重要、信息密度高、具有长期价值的精品内容；合并重复事件，避免把普通产品宣传当成重大突破。"
      : "你是严谨的AI日报主编。请把最近抓取并发布的重要动态整理成快速可读的日报；合并重复事件，优先官方来源，不夸大。";
    const requirements = isWeekly
      ? "输出5-8条精品内容。每条必须包含：title（自然中文标题）、summary（80-140字说明发生了什么）、analysis（180-320字中文深度解读，说明长期影响、适用人群与潜在限制）、takeaways（2-3条中文行动建议或观察点）、article_slug。按重要性排序。"
      : "输出5-10条要点。每条summary用50-100字说明事实和影响，适合3分钟快速阅读。按重要性排序。";
    const result = await env.AI.run(
      env.AI_MODEL as keyof AiModels,
      {
        messages: [
          {
            role: "system",
            content: `${role} 只能依据给定条目，输出严格JSON，不要使用Markdown。`,
          },
          {
            role: "user",
            content: `请生成中文${isWeekly ? "精品资讯周报" : "AI资讯日报"}。输出字段 title、intro、highlights；${isWeekly ? "highlights每项必须包含title、summary、analysis、takeaways、article_slug" : "highlights每项必须包含title、summary、article_slug"}，并保留给定slug。所有输出必须使用简体中文；品牌名和模型名可以保留英文。${requirements}\n\n条目：${JSON.stringify(articles)}`,
          },
        ],
        max_tokens: isWeekly ? 2200 : 1600,
        temperature: 0.2,
      } as never,
    );
    const parsed = parseJsonFromModel(modelText(result));
    return {
      title: clampText(String(parsed.title || fallback.title), 120),
      intro: clampText(String(parsed.intro || fallback.intro), 360),
      highlights: Array.isArray(parsed.highlights)
        ? parsed.highlights.slice(0, isWeekly ? 8 : 10).map((item) => {
            const object = item as Record<string, unknown>;
            const takeaways = Array.isArray(object.takeaways)
              ? object.takeaways.map(String).filter(Boolean).slice(0, 3)
              : [];
            return {
              title: clampText(String(object.title || "重点更新"), 140),
              summary: clampText(
                String(object.summary || ""),
                isWeekly ? 320 : 260,
              ),
              analysis: isWeekly
                ? clampText(
                    String(object.analysis || object.summary || ""),
                    700,
                  )
                : undefined,
              takeaways: isWeekly ? takeaways : undefined,
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
  if (/agent|工作流|提示词|自动化|教程|实践/.test(normalized))
    return "practice";
  if (/模型|发布|产品|版本|api|工具/.test(normalized)) return "products";
  return "basics";
}

function inferTags(text: string) {
  const candidates = [
    "大模型",
    "Agent",
    "RAG",
    "多模态",
    "AI工具",
    "工作流",
    "研究",
    "安全",
    "开源",
    "产品更新",
  ];
  const matched = candidates.filter((tag) =>
    text.toLowerCase().includes(tag.toLowerCase()),
  );
  return (matched.length ? matched : ["AI动态", "知识更新"]).slice(0, 4);
}
