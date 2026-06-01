"use server";

import { getAnswer } from "../llm";
import { parseAIGeneratedJSON } from "@/utils/json";
import { createLogger } from "@/lib/logger";
import type {
  ReadingResult,
  SentencePair,
  Stage1Response,
} from "./types";
const log = createLogger("reading-orchestrator");

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function translateAndSplit(
  sourceText: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<Array<{ sourceSentence: string; translatedSentence: string }>> {
  try {
    const result = await getAnswer(
      [
        {
          role: "system",
          content: `翻译并按句子拆分。将源文本和翻译按句子自然边界拆为一一对应的句子对。
只返回 JSON，格式如下：
{"sentencePairs":[{"sourceSentence":"第一句","translatedSentence":"翻译"},{"sourceSentence":"第二句","translatedSentence":"翻译"}]}`,
        },
        {
          role: "user",
          content: `源语言：${sourceLanguage}，目标语言：${targetLanguage}

<source_text>${escapeXml(sourceText)}</source_text>`,
        },
      ],
      { jsonMode: true }
    ).then(parseAIGeneratedJSON<Stage1Response>);

    if (!Array.isArray(result.sentencePairs) || result.sentencePairs.length === 0) {
      throw new Error("sentencePairs 为空或格式错误");
    }

    for (const pair of result.sentencePairs) {
      if (!pair.sourceSentence || !pair.translatedSentence) {
        throw new Error("句子对中包含空字段");
      }
    }

    return result.sentencePairs;
  } catch (error) {
    log.error("翻译并拆分句子失败", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw new Error("翻译并拆分句子失败");
  }
}

const SYSTEM_PROMPT_ALIGN = `给定一对源语言句子和目标语言译文，进行分词和逐词对齐。

## 分词规则
- 按词分 token，不做过度拆分：
  - 中日韩：按词/短语边界切分，不在词内部切分（例："图书馆"是一个 token，不拆成"图""书""馆"）
  - 英法德等空格语言：按空格分词，标点独立成 token，不拆词缀（例："don't" → "do" + "n't"，"running" 保持一个 token）
  - 所有语言：标点符号独立为单独 token
- token 按原文顺序排列，index 从 0 连续递增

## 对齐规则（严格遵守）
1. 每个源语言 token 恰好出现在一条对齐中（不重复、不遗漏）
2. 每个目标语言 token 恰好出现在一条对齐中（不重复、不遗漏）
3. 对齐按源语言 token 顺序排列，sourceIndices 连续递增且不重叠
4. 每条对齐的 sourceIndices 最多 3 个元素，targetIndices 最多 3 个元素
5. 语法功能词（冠词 the/a、介词 to/of、助词 的/了/着 等）与它们修饰的实词合并到同一条对齐
6. 当一种语言的词在另一种语言中没有直接对应词时（如"虽然...但是"翻译为"Although"），将无对应的词与相邻实词合并到同一条对齐中

## 输出格式
严格返回一个 JSON 对象：
{"sourceTokens":[...],"targetTokens":[...],"alignments":[...]}
- sourceTokens / targetTokens：字符串数组，按原文顺序
- alignments：每条包含 sourceIndices 和 targetIndices（整数数组），值必须 < 对应 tokens 数组长度

## 示例 1（中→英）
source="他昨天去了图书馆。" target="He went to the library yesterday."
{
  "sourceTokens": ["他", "昨天", "去", "了", "图书馆", "。"],
  "targetTokens": ["He", "went", "to", "the", "library", "yesterday", "."],
  "alignments": [
    {"sourceIndices": [0], "targetIndices": [0]},
    {"sourceIndices": [1], "targetIndices": [5]},
    {"sourceIndices": [2, 3], "targetIndices": [1]},
    {"sourceIndices": [4], "targetIndices": [2, 3, 4]},
    {"sourceIndices": [5], "targetIndices": [6]}
  ]
}

## 示例 2（英→中）
source="The quick brown fox jumps over the lazy dog." target="敏捷的棕色狐狸跳过了那只懒狗。"
{
  "sourceTokens": ["The", "quick", "brown", "fox", "jumps", "over", "the", "lazy", "dog", "."],
  "targetTokens": ["敏捷", "的", "棕色", "狐狸", "跳过", "了", "那只", "懒", "狗", "。"],
  "alignments": [
    {"sourceIndices": [0, 1], "targetIndices": [0, 1]},
    {"sourceIndices": [2], "targetIndices": [2]},
    {"sourceIndices": [3], "targetIndices": [3]},
    {"sourceIndices": [4, 5], "targetIndices": [4, 5]},
    {"sourceIndices": [6], "targetIndices": [6]},
    {"sourceIndices": [7], "targetIndices": [7]},
    {"sourceIndices": [8], "targetIndices": [8]},
    {"sourceIndices": [9], "targetIndices": [9]}
  ]
}

## 示例 3（中→英，包含无对应词）
source="尽管天气很冷，但我们还是决定出去散步。" target="Although it was very cold, we still decided to go for a walk."
{
  "sourceTokens": ["尽管", "天气", "很", "冷", "，", "但", "我们", "还是", "决定", "出去", "散步", "。"],
  "targetTokens": ["Although", "it", "was", "very", "cold", ",", "we", "still", "decided", "to", "go", "for", "a", "walk", "."],
  "alignments": [
    {"sourceIndices": [0], "targetIndices": [0]},
    {"sourceIndices": [1, 2, 3], "targetIndices": [1, 2, 3, 4]},
    {"sourceIndices": [4], "targetIndices": [5]},
    {"sourceIndices": [5, 6], "targetIndices": [6]},
    {"sourceIndices": [7], "targetIndices": [7]},
    {"sourceIndices": [8], "targetIndices": [8]},
    {"sourceIndices": [9], "targetIndices": [9, 10]},
    {"sourceIndices": [10], "targetIndices": [11, 12, 13]},
    {"sourceIndices": [11], "targetIndices": [14]}
  ]
}`;

interface SingleAlignResult {
  sourceTokens: Array<{ text: string; index: number }>;
  targetTokens: Array<{ text: string; index: number }>;
  alignments: Array<{ sourceIndices: number[]; targetIndices: number[] }>;
}

async function tokenizeAndAlignOne(
  sourceSentence: string,
  translatedSentence: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<SingleAlignResult> {
  const result = await getAnswer(
    [
      { role: "system", content: SYSTEM_PROMPT_ALIGN },
      {
        role: "user",
        content: `源语言：${sourceLanguage}，目标语言：${targetLanguage}\n<source>${escapeXml(sourceSentence)}</source>\n<target>${escapeXml(translatedSentence)}</target>`,
      },
    ],
    { jsonMode: true }
  ).then(parseAIGeneratedJSON<{ sourceTokens: string[]; targetTokens: string[]; alignments: Array<{ sourceIndices: number[]; targetIndices: number[] }> }>);

  if (!Array.isArray(result.sourceTokens) || result.sourceTokens.length === 0) {
    throw new Error("sourceTokens 为空或格式错误");
  }
  if (!Array.isArray(result.targetTokens) || result.targetTokens.length === 0) {
    throw new Error("targetTokens 为空或格式错误");
  }
  if (!Array.isArray(result.alignments) || result.alignments.length === 0) {
    throw new Error("alignments 为空或格式错误");
  }

  // Clamp out-of-bounds indices
  const srcLen = result.sourceTokens.length;
  const tgtLen = result.targetTokens.length;
  const clampedAlignments = result.alignments
    .map((a: { sourceIndices: number[]; targetIndices: number[] }) => ({
      sourceIndices: [...new Set(a.sourceIndices.filter((n: number) => n >= 0 && n < srcLen))],
      targetIndices: [...new Set(a.targetIndices.filter((n: number) => n >= 0 && n < tgtLen))],
    }))
    .filter((a) => a.sourceIndices.length > 0 && a.targetIndices.length > 0);

  // Fill uncovered source/target tokens with fallback 1:1 pairing
  const srcCovered = new Set(clampedAlignments.flatMap((a) => a.sourceIndices));
  const tgtCovered = new Set(clampedAlignments.flatMap((a) => a.targetIndices));

  for (let i = 0; i < srcLen; i++) {
    if (!srcCovered.has(i)) {
      const bestTarget = Math.min(Math.floor((i / srcLen) * tgtLen), tgtLen - 1);
      const t = tgtCovered.has(bestTarget) ? (tgtLen > srcLen ? bestTarget + 1 : bestTarget) % tgtLen : bestTarget;
      clampedAlignments.push({ sourceIndices: [i], targetIndices: [t] });
      tgtCovered.add(t);
      srcCovered.add(i);
    }
  }
  for (let j = 0; j < tgtLen; j++) {
    if (!tgtCovered.has(j)) {
      const bestSource = Math.min(Math.floor((j / tgtLen) * srcLen), srcLen - 1);
      clampedAlignments.push({ sourceIndices: [bestSource], targetIndices: [j] });
    }
  }

  return {
    sourceTokens: result.sourceTokens.map((text: string, index: number) => ({ text, index })),
    targetTokens: result.targetTokens.map((text: string, index: number) => ({ text, index })),
    alignments: clampedAlignments,
  };
}

async function tokenizeAndAlignAll(
  sentencePairs: Array<{ sourceSentence: string; translatedSentence: string }>,
  sourceLanguage: string,
  targetLanguage: string
): Promise<SingleAlignResult[]> {
  log.debug("[Stage 2] 并行处理所有句子", { count: sentencePairs.length });
  const results = await Promise.all(
    sentencePairs.map((pair, i) =>
      tokenizeAndAlignOne(
        pair.sourceSentence,
        pair.translatedSentence,
        sourceLanguage,
        targetLanguage
      ).then((result) => {
        log.debug("[Stage 2] 句子完成", { index: i });
        return result;
      })
    )
  );
  log.debug("[Stage 2] 所有句子处理完成", { count: results.length });
  return results;
}

export async function executeReadingTranslation(
  sourceText: string,
  targetLanguage: string,
  sourceLanguage?: string
): Promise<ReadingResult> {
  try {
    log.info("开始阅读翻译流程");

    const detectedSourceLanguage = sourceLanguage || "auto";

    log.debug("[Stage 1] 翻译并拆分句子");
    const sentencePairs = await translateAndSplit(
      sourceText,
      detectedSourceLanguage,
      targetLanguage
    );
    log.debug("[Stage 1] 完成", { sentenceCount: sentencePairs.length });

    log.debug("[Stage 2] 批量分词和对齐");
    const tokenResults = await tokenizeAndAlignAll(
      sentencePairs,
      detectedSourceLanguage,
      targetLanguage
    );

    const enrichedPairs: SentencePair[] = sentencePairs.map((pair, i) => ({
      sourceSentence: pair.sourceSentence,
      translatedSentence: pair.translatedSentence,
      sourceTokens: tokenResults[i].sourceTokens,
      targetTokens: tokenResults[i].targetTokens,
      alignments: tokenResults[i].alignments,
    }));
    log.debug("[Stage 2] 完成", { pairCount: enrichedPairs.length });

    const result: ReadingResult = {
      sourceLanguage: detectedSourceLanguage,
      targetLanguage,
      sentences: enrichedPairs,
    };

    log.info("阅读翻译流程完成");
    return result;
  } catch (error) {
    log.error("阅读翻译流程失败", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
