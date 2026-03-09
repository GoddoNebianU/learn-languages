import { getAnswer } from "../zhipu";
import { parseAIGeneratedJSON } from "@/utils/json";
import { PreprocessResult } from "./types";
import { createLogger } from "@/lib/logger";

const log = createLogger("dictionary-preprocess");

export async function preprocessInput(
    text: string,
    queryLang: string
): Promise<PreprocessResult> {
    const prompt = `
你是一个词典预处理系统。分析输入并生成标准形式。

用户输入：<input>${text}</input>
查询语言：<queryLang>${queryLang}</queryLang>

任务：
1. 判断输入是否有效（非空、是自然语言）
2. 识别输入类型（单词/短语）
3. 将输入转换为查询语言的对应词（语义映射）
4. 生成标准形式（必须是查询语言）

重要规则：
- standardForm 必须是查询语言的词汇
- 例如：查询语言=维吾尔语，输入="japanese" → standardForm="ياپونىيە"
- 例如：查询语言=中文，输入="japanese" → standardForm="日语"
- 例如：查询语言=English，输入="日语" → standardForm="Japanese"
- 如果输入本身就是查询语言，则保持不变
- 只做词典形式还原，不纠正拼写

返回 JSON：
{
  "isValid": boolean,
  "inputType": "word" | "phrase",
  "standardForm": "查询语言对应的标准形式",
  "confidence": "high" | "medium" | "low",
  "reason": "错误原因，成功时为空字符串"
}

注意：
- isValid=false 时，在 reason 中说明原因
- 成功时 reason 为空字符串 ""
- 只返回 JSON，不要其他文字
`.trim();

    try {
        const result = await getAnswer([
            {
                role: "system",
                content: "你是词典预处理系统，只返回 JSON。",
            },
            {
                role: "user",
                content: prompt,
            },
        ]).then(parseAIGeneratedJSON<PreprocessResult>);

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

        return {
            isValid: result.isValid,
            inputType: result.inputType as "word" | "phrase",
            standardForm: result.standardForm,
            confidence,
            reason: typeof result.reason === "string" ? result.reason : "",
        };
    } catch (error) {
        log.error("Preprocess failed", { error: error instanceof Error ? error.message : String(error) });
        throw error;
    }
}
