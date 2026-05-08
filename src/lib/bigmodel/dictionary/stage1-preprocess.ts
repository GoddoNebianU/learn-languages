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

export async function preprocessInput(text: string, queryLang: string): Promise<PreprocessResult> {
  const prompt = `
你是一个词典预处理系统。分析输入并生成标准形式（词典原形）。

用户输入：<input>${escapeXml(text)}</input>
查询语言：<queryLang>${queryLang}</queryLang>

任务：
1. 判断输入是否有效（非空、是自然语言）
2. 识别输入类型（单词/短语）
3. 将输入转换为查询语言的对应词（语义映射）
4. 还原为词典原形（standardForm）

【核心规则：词形还原】
standardForm 必须是该词在词典中的原形（lemma），即：
- 英语：复数→单数（cats→cat），过去式→不定式（ran→run, played→play），比较级→原级（bigger→big），进行时→不定式（running→run），第三人称→不定式（goes→go）
- 日语：送假名还原（走った→走る），て形→辞书形（飲んで→飲む），过去→辞书形（食べた→食べる）
- 韩语：活用形→辞典形（먹었어→먹다, 해요→하다）
- 德语：变格→原形（des Buches→Buch），比较级→原级（größer→groß）
- 法语：变位→不定式（mangeait→manger），阴性/复数→阳性单数（belles→beau）
- 中文、维吾尔语等屈折变化少的语言保持原形
- 短语不还原，保留完整形式

【语义映射】
- 查询语言=维吾尔语，输入="japanese" → "ياپونىيە"
- 查询语言=中文，输入="japanese" → "日语"
- 查询语言=English，输入="日语" → "Japanese"
- 如果输入本身就是查询语言，则只做词形还原，不做翻译

返回 JSON：
{
  "isValid": boolean,
  "inputType": "word" | "phrase",
  "standardForm": "词典原形",
  "confidence": "high" | "medium" | "low",
  "reason": "错误原因，成功时为空字符串"
}

注意：
- isValid=false 时，在 reason 中说明原因
- 成功时 reason 为空字符串 ""
- 只返回 JSON，不要其他文字
`.trim();

  try {
    const result = await getAnswer(
      [
        {
          role: "system",
          content: "你是词典预处理系统，只返回 JSON。",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      { jsonMode: true }
    ).then(parseAIGeneratedJSON<PreprocessResult>);

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
  } catch (error) {
    log.error("Preprocess failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
