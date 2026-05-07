"use server";

import OpenAI from "openai";
import { parseAIGeneratedJSON } from "@/utils/json";
import { createLogger } from "@/lib/logger";
import { getZhipuApiKey } from "@/lib/env";
import { OCRInput, OCROutput, OCRRawResponse } from "./types";

const log = createLogger("ocr-orchestrator");

let _openai: OpenAI | null = null;
function getOpenAIClient() {
  if (!_openai) {
    const apiKey = getZhipuApiKey();
    _openai = new OpenAI({
      apiKey,
      baseURL: "https://open.bigmodel.cn/api/paas/v4",
    });
  }
  return _openai;
}

/**
 * Executes OCR on an image to extract vocabulary word-definition pairs.
 *
 * Uses GLM-4.6V vision model to analyze vocabulary table images and
 * extract structured word-definition pairs.
 *
 * @param input - OCR input containing base64 image and optional language hints
 * @returns Structured output with extracted pairs and detected languages
 * @throws Error if OCR fails or response is malformed
 *
 * @example
 * ```typescript
 * const result = await executeOCR({
 *   imageBase64: "iVBORw0KGgo...",
 *   sourceLanguage: "English",
 *   targetLanguage: "Chinese"
 * });
 * // result.pairs: [{ word: "hello", definition: "你好" }, ...]
 * ```
 */
export async function executeOCR(input: OCRInput): Promise<OCROutput> {
  const { imageBase64, sourceLanguage, targetLanguage } = input;

  log.debug("Starting OCR", {
    hasSourceHint: !!sourceLanguage,
    hasTargetHint: !!targetLanguage,
    imageLength: imageBase64.length,
  });

  const languageHints: string[] = [];
  if (sourceLanguage) {
    languageHints.push(`源语言提示: ${sourceLanguage}`);
  }
  if (targetLanguage) {
    languageHints.push(`目标语言提示: ${targetLanguage}`);
  }

  const prompt = `
你是一个专业的OCR识别助手，专门从词汇表截图中提取单词和释义。

${languageHints.length > 0 ? `语言提示：\n${languageHints.join("\n")}\n` : ""}

你的任务是分析图片中的词汇表，提取所有单词-释义对。

要求：
1. 识别图片中的词汇表结构（可能是两列或多列）
2. 提取每一行的单词和对应的释义/翻译
3. 自动检测源语言和目标语言
4. 保持原始大小写和拼写
5. 如果图片模糊或不清晰，尽力识别并标注置信度较低的项目
6. 忽略表头、页码等非词汇内容

返回 JSON 格式：
{
  "pairs": [
    { "word": "单词1", "definition": "释义1" },
    { "word": "单词2", "definition": "释义2" }
  ],
  "detectedSourceLanguage": "检测到的源语言",
  "detectedTargetLanguage": "检测到的目标语言"
}

只返回 JSON，不要任何其他文字。
`.trim();

  try {
    const response = await getOpenAIClient().chat.completions.create({
      model: "glm-4.6v",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: imageBase64,
              },
            },
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      log.error("OCR returned empty response");
      throw new Error("OCR 返回空响应");
    }

    log.debug("Received OCR response", { contentLength: content.length });

    const parsed = parseAIGeneratedJSON<OCRRawResponse>(content);

    if (!parsed.pairs || !Array.isArray(parsed.pairs)) {
      log.error("Invalid OCR response: missing or invalid pairs array", { parsed });
      throw new Error("OCR 响应格式无效：缺少 pairs 数组");
    }

    const validPairs = parsed.pairs.filter((pair) => {
      const isValid = typeof pair.word === "string" && typeof pair.definition === "string";
      if (!isValid) {
        log.warn("Skipping invalid pair", { pair });
      }
      return isValid;
    });

    if (validPairs.length === 0) {
      log.error("No valid pairs extracted from image");
      throw new Error("未能从图片中提取有效的词汇对");
    }

    const result: OCROutput = {
      pairs: validPairs,
      detectedSourceLanguage: parsed.detectedSourceLanguage,
      detectedTargetLanguage: parsed.detectedTargetLanguage,
    };

    log.info("OCR completed successfully", {
      pairCount: result.pairs.length,
      sourceLanguage: result.detectedSourceLanguage,
      targetLanguage: result.detectedTargetLanguage,
    });

    return result;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("OCR")) {
      throw error;
    }

    log.error("OCR failed", { error });
    const errorMessage = error instanceof Error ? error.message : "未知错误";
    throw new Error(`OCR 处理失败: ${errorMessage}`);
  }
}
