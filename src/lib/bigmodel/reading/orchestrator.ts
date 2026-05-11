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

const SYSTEM_PROMPT_ALIGN = `对单对句子进行分词和逐词对齐。
规则：
- 按最小语义单元分词（中文按词，日语按助词边界，韩语按空格和助词），标点独立
- 细粒度 1:1 对齐，禁止整句批量对齐
- 每个 token 至少出现在一个对齐中
- 虚词/助词无对应时可合并到相邻对齐
只返回单个 JSON 对象，格式如下：
{"sourceTokens":["我","喜欢","猫"],"targetTokens":["I","like","cats"],"alignments":[{"sourceIndices":[0],"targetIndices":[0]},{"sourceIndices":[1],"targetIndices":[1]},{"sourceIndices":[2],"targetIndices":[2]}]}`;

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

  return {
    sourceTokens: result.sourceTokens.map((text: string, index: number) => ({ text, index })),
    targetTokens: result.targetTokens.map((text: string, index: number) => ({ text, index })),
    alignments: result.alignments.map(
      (a: { sourceIndices: number[]; targetIndices: number[] }) => ({
        sourceIndices: a.sourceIndices,
        targetIndices: a.targetIndices,
      })
    ),
  };
}

async function tokenizeAndAlignAll(
  sentencePairs: Array<{ sourceSentence: string; translatedSentence: string }>,
  sourceLanguage: string,
  targetLanguage: string
): Promise<SingleAlignResult[]> {
  const results: SingleAlignResult[] = [];
  for (let i = 0; i < sentencePairs.length; i++) {
    log.debug("[Stage 2] 处理句子", { index: i });
    results[i] = await tokenizeAndAlignOne(
      sentencePairs[i].sourceSentence,
      sentencePairs[i].translatedSentence,
      sourceLanguage,
      targetLanguage
    );
    log.debug("[Stage 2] 句子完成", { index: i });
  }
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
