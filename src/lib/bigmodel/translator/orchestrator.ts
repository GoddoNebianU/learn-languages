import { getAnswer } from "../llm";
import { parseAIGeneratedJSON } from "@/utils/json";
import { stripIpaBrackets } from "@/utils/string";
import { LanguageDetectionResult, TranslationLLMResponse } from "./types";
import { createLogger } from "@/lib/logger";

const log = createLogger("translator-orchestrator");

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function detectLanguage(text: string): Promise<LanguageDetectionResult> {
  const prompt = `
你是一个语言识别专家。分析用户输入并返回 JSON 结果。

用户输入位于 <text> 标签内：
<text>${escapeXml(text)}</text>

你的任务是：
1. 识别输入文本的语言
2. 评估识别置信度

返回 JSON 格式：
{
  "sourceLanguage": "检测到的语言名称（如 English、中文、日本語、Français、Deutsch等）",
  "confidence": "high/medium/low"
}

只返回 JSON，不要任何其他文字。
`.trim();

  try {
    const result = await getAnswer([
      {
        role: "system",
        content: "你是一个语言识别专家，只返回 JSON 格式的分析结果。",
      },
      {
        role: "user",
        content: prompt,
      },
    ]).then(parseAIGeneratedJSON<LanguageDetectionResult>);

    if (typeof result.sourceLanguage !== "string" || !result.sourceLanguage) {
      throw new Error("Invalid source language detected");
    }

    return result;
  } catch (error) {
    log.error("Language detection failed", { error });
    throw new Error("Failed to detect source language");
  }
}

async function performTranslation(
  sourceText: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<string> {
  const prompt = `
你是一个专业翻译。将文本翻译成目标语言。

源文本位于 <source_text> 标签内：
<source_text>${escapeXml(sourceText)}</source_text>

源语言：${sourceLanguage}
目标语言：${targetLanguage}

要求：
1. 保持原意准确
2. 符合目标语言的表达习惯
3. 如果是成语、俗语或文化特定表达，在目标语言中寻找对应表达
4. 只返回翻译结果，不要任何解释或说明

请直接返回翻译结果：
`.trim();

  try {
    const result = await getAnswer([
      {
        role: "system",
        content: "你是一个专业翻译，只返回翻译结果。",
      },
      {
        role: "user",
        content: prompt,
      },
    ]);

    return result.trim();
  } catch (error) {
    log.error("Translation failed", { error });
    throw new Error("Translation failed");
  }
}

async function generateIPA(text: string, language: string): Promise<string> {
  const prompt = `
你是一个语音学专家。为文本生成国际音标（IPA）标注。

文本位于 <text> 标签内：
<text>${escapeXml(text)}</text>

语言：${language}

要求：
1. 生成准确的国际音标（IPA）标注
2. 使用标准的 IPA 符号
3. 只返回 IPA 标注，不要任何其他文字

请直接返回 IPA 标注：
`.trim();

  try {
    const result = await getAnswer([
      {
        role: "system",
        content: "你是一个语音学专家，只返回 IPA 标注。",
      },
      {
        role: "user",
        content: prompt,
      },
    ]);

    return stripIpaBrackets(result);
  } catch (error) {
    log.error("IPA generation failed", { error });
    return "";
  }
}

export async function executeTranslation(
  sourceText: string,
  targetLanguage: string,
  needIpa: boolean,
  sourceLanguage?: string
): Promise<TranslationLLMResponse> {
  try {
    log.info("Starting translation", {
      sourceText: sourceText.substring(0, 100),
      targetLanguage,
      needIpa,
      sourceLanguage: sourceLanguage || "(auto-detect)",
    });

    let detectedLanguage: string;

    if (sourceLanguage) {
      log.debug("[Stage 1] Using provided source language", { sourceLanguage });
      detectedLanguage = sourceLanguage;
    } else {
      log.debug("[Stage 1] Detecting source language");
      const detectionResult = await detectLanguage(sourceText);
      log.debug("[Stage 1] Detection result", { detectionResult });
      detectedLanguage = detectionResult.sourceLanguage;
    }

    log.debug("[Stage 2] Performing translation");
    const translatedText = await performTranslation(sourceText, detectedLanguage, targetLanguage);
    log.debug("[Stage 2] Translation complete", { translatedText });

    // Validate translation result
    if (!translatedText) {
      throw new Error("Translation result is empty");
    }

    // Stage 3 (Optional): Generate IPA
    let sourceIpa: string | undefined;
    let targetIpa: string | undefined;

    if (needIpa) {
      log.debug("[Stage 3] Generating IPA in parallel");
      [sourceIpa, targetIpa] = await Promise.all([
        generateIPA(sourceText, detectedLanguage),
        generateIPA(translatedText, targetLanguage),
      ]);
      log.debug("[Stage 3] IPA complete", { sourceIpa, targetIpa });
    }

    // Assemble final result
    const finalResult: TranslationLLMResponse = {
      sourceText,
      translatedText,
      sourceLanguage: detectedLanguage,
      targetLanguage,
      sourceIpa,
      targetIpa,
    };

    log.info("Translation completed successfully");
    return finalResult;
  } catch (error) {
    log.error("Translation failed", { error });
    const errorMessage = error instanceof Error ? error.message : "未知错误";
    throw new Error(errorMessage, { cause: error });
  }
}
