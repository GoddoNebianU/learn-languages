import { getAnswer } from "../llm";
import { parseAIGeneratedJSON } from "@/utils/json";
import { PreprocessResult } from "./types";
import { createLogger } from "@/lib/logger";

const log = createLogger("dictionary-preprocess");

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

type ScriptFamily = "latin" | "cjk" | "korean" | "arabic" | "cyrillic" | "unknown";

function detectScript(text: string): ScriptFamily {
  for (const char of text) {
    const cp = char.codePointAt(0);
    if (cp === undefined) continue;
    // Arabic + Arabic Extended + Arabic Presentation Forms
    if ((cp >= 0x0600 && cp <= 0x06ff) || (cp >= 0x0750 && cp <= 0x077f) || (cp >= 0xfb50 && cp <= 0xfdff) || (cp >= 0xfe70 && cp <= 0xfeff)) return "arabic";
    // CJK Unified Ideographs + CJK Extension A/B
    if ((cp >= 0x4e00 && cp <= 0x9fff) || (cp >= 0x3400 && cp <= 0x4dbf)) return "cjk";
    // Hiragana + Katakana (treat as CJK since Japanese uses kanji too)
    if ((cp >= 0x3040 && cp <= 0x309f) || (cp >= 0x30a0 && cp <= 0x30ff)) return "cjk";
    // Hangul
    if ((cp >= 0xac00 && cp <= 0xd7af) || (cp >= 0x1100 && cp <= 0x11ff)) return "korean";
    // Cyrillic
    if ((cp >= 0x0400 && cp <= 0x04ff) || (cp >= 0x0500 && cp <= 0x052f)) return "cyrillic";
    // Latin (basic + extended)
    if ((cp >= 0x0041 && cp <= 0x007a) || (cp >= 0x00c0 && cp <= 0x024f)) return "latin";
  }
  return "unknown";
}

const QUERY_LANG_SCRIPT_MAP: Record<string, ScriptFamily> = {
  english: "latin",
  chinese: "cjk",
  japanese: "cjk",
  korean: "korean",
  italian: "latin",
  uyghur: "arabic",
};

function inputScriptDiffersFromQueryLang(text: string, queryLangNative: string): boolean {
  const inputScript = detectScript(text);

  const langEntries: Array<{ nativeName: string; script: ScriptFamily }> = [
    { nativeName: "English", script: "latin" },
    { nativeName: "中文", script: "cjk" },
    { nativeName: "日本語", script: "cjk" },
    { nativeName: "한국어", script: "korean" },
    { nativeName: "Italiano", script: "latin" },
    { nativeName: "ئۇيغۇرچە", script: "arabic" },
  ];

  const expectedScript = langEntries.find((e) => queryLangNative === e.nativeName)?.script;
  if (!expectedScript || inputScript === "unknown") return false;

  return inputScript !== expectedScript;
}

function buildPreprocessPrompt(text: string, queryLang: string, retryHint?: string): string {
  const retrySection = retryHint
    ? `
【⚠️ 重要提醒】
${retryHint}
你必须输出查询语言"${queryLang}"中的词，不要输出用户原始输入。
`
    : "";

  return `
你是一个词典预处理系统。你的核心任务是将用户输入转换为查询语言的词典原形。

用户输入：<input>${escapeXml(text)}</input>
查询语言：<queryLang>${queryLang}</queryLang>
${retrySection}
【处理流程（严格按顺序执行）】

第一步：识别输入语言
判断用户输入是什么语言（英语、中文、日语等）。

第二步：语言转换（最重要的一步！）
- 如果输入语言 ≠ 查询语言：必须先将输入翻译为查询语言的对应词
- 如果输入语言 = 查询语言：跳过翻译，直接进入第三步

翻译示例（必须严格遵守）：
- 查询语言=ئۇيغۇرچە，输入="japanese" → standardForm 必须是 "ياپونىيە"
- 查询语言=中文，输入="japanese" → standardForm 必须是 "日语"
- 查询语言=English，输入="日语" → standardForm 必须是 "Japanese"
- 查询语言=中文，输入="cat" → standardForm 必须是 "猫"
- 查询语言=English，输入="猫" → standardForm 必须是 "cat"
- 查询语言=English，输入="cats" → standardForm 必须是 "cat"（同语言，只做词形还原）

第三步：词形还原
将上一步的结果还原为词典原形（lemma）：
- 英语：复数→单数（cats→cat），过去式→不定式（ran→run），比较级→原级（bigger→big），进行时→不定式（running→run），第三人称→不定式（goes→go）
- 日语：送假名还原（走った→走る），て形→辞书形（飲んで→飲む），过去→辞书形（食べた→食べる）
- 韩语：活用形→辞典形（먹었어→먹다, 해요→하다）
- 中文、ئۇيغۇرچە等屈折变化少的语言保持原形
- 短语不还原，保留完整形式

第四步：验证
确认 standardForm 是查询语言中的词，不是输入语言的词。

返回 JSON：
{
  "isValid": boolean,
  "inputType": "word" | "phrase",
  "standardForm": "词典原形（必须是查询语言）",
  "confidence": "high" | "medium" | "low",
  "reason": "错误原因，成功时为空字符串"
}

注意：
- isValid=false 时，在 reason 中说明原因
- 成功时 reason 为空字符串 ""
- 只返回 JSON，不要其他文字
`.trim();
}

function validatePreprocessResult(result: PreprocessResult): PreprocessResult {
  if (typeof result.isValid !== "boolean") {
    throw new Error("预处理：isValid 字段类型错误");
  }

  if (!result.standardForm || result.standardForm.trim().length === 0) {
    throw new Error(result.reason || "预处理：standardForm 为空");
  }

  if (!["word", "phrase"].includes(result.inputType)) {
    result.inputType = result.standardForm.includes(" ") ? "phrase" : "word";
  }

  let confidence: "high" | "medium" | "low" = "low";
  const cv = result.confidence?.toLowerCase();
  if (cv === "高" || cv === "high") confidence = "high";
  else if (cv === "中" || cv === "medium") confidence = "medium";
  else log.warn("Unexpected confidence value from LLM", { confidence: result.confidence });

  return {
    isValid: result.isValid,
    inputType: result.inputType as "word" | "phrase",
    standardForm: result.standardForm,
    confidence,
    reason: typeof result.reason === "string" ? result.reason : "",
  };
}

export async function preprocessInput(text: string, queryLang: string): Promise<PreprocessResult> {
  try {
    const result = await callPreprocessLLM(text, queryLang);

    if (!result.isValid) {
      return result;
    }

    if (
      result.standardForm.trim().toLowerCase() === text.trim().toLowerCase() &&
      inputScriptDiffersFromQueryLang(text, queryLang)
    ) {
      log.info("LLM returned untranslated input, retrying with explicit hint", {
        text,
        queryLang,
        standardForm: result.standardForm,
      });

      const retried = await callPreprocessLLM(
        text,
        queryLang,
        `上一次你返回了 "${result.standardForm}"，这是用户原始输入，不是查询语言的词。请将输入翻译为查询语言"${queryLang}"的对应词。`
      );

      if (retried.isValid && retried.standardForm.trim().toLowerCase() !== text.trim().toLowerCase()) {
        log.info("Retry succeeded", { standardForm: retried.standardForm });
        return retried;
      }

      log.warn("Retry also returned untranslated input, using original result", {
        standardForm: retried.standardForm,
      });
    }

    return result;
  } catch (error) {
    log.error("Preprocess failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

async function callPreprocessLLM(text: string, queryLang: string, retryHint?: string): Promise<PreprocessResult> {
  const prompt = buildPreprocessPrompt(text, queryLang, retryHint);

  const result = await getAnswer(
    [
      {
        role: "system",
        content: "你是词典预处理系统，只返回 JSON。你的首要任务是确保 standardForm 使用查询语言。",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    { jsonMode: true }
  ).then(parseAIGeneratedJSON<PreprocessResult>);

  return validatePreprocessResult(result);
}
