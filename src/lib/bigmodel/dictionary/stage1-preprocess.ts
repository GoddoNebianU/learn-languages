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
2. 识别输入语言和类型（单词/短语）
3. 如果输入语言 ≠ 查询语言，判断是否需要语义映射
4. 生成查询语言下的标准形式

语义映射规则：
- 只有当输入是"明确、基础、可词典化的语义概念"（如常见动词、名词、形容词）时才映射
- 复杂句子、专业术语、无法确定语义的词汇不映射，直接用原文

标准形式规则：
- 修正拼写错误
- 还原为词典形式（英语：动词原形/名词单数；日语：辞书形；中文：标准简化字）

返回 JSON：
{
  "isValid": boolean,
  "inputType": "word" | "phrase",
  "standardForm": "标准形式",
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
        log.error("Preprocess failed", { error });
        throw error;
    }
}
