import { getAnswer } from "../zhipu";
import { parseAIGeneratedJSON } from "@/utils/json";
import { InputAnalysisResult } from "./types";
import { createLogger } from "@/lib/logger";

const log = createLogger("dictionary-stage1");

/**
 * 阶段 1：输入解析与语言识别
 *
 * 独立的 LLM 调用，分析输入文本
 */

export async function analyzeInput(text: string): Promise<InputAnalysisResult> {
    const prompt = `
你是一个输入分析器。分析用户输入并返回 JSON 结果。

用户输入位于 <text> 标签内：
<text>${text}</text>

你的任务是：
1. 判断输入是否为空或明显非法
2. 判断输入是「单词」还是「短语」
3. 识别输入所属语言

返回 JSON 格式：
{
  "isValid": true/false,
  "isEmpty": true/false,
  "isNaturalLanguage": true/false,
  "inputLanguage": "检测到的语言名称（如 English、中文、日本語等）",
  "inputType": "word/phrase/unknown",
  "reason": "错误原因，成功时为空字符串\"\""
}

若输入为空、非自然语言或无法识别语言，设置 isValid 为 false，并在 reason 中说明原因。
若输入有效，设置 isValid 为 true，reason 为空字符串 ""。
只返回 JSON，不要任何其他文字。
`.trim();

    try {
        const result = await getAnswer([
            {
                role: "system",
                content: "你是一个输入分析器，只返回 JSON 格式的分析结果。",
            },
            {
                role: "user",
                content: prompt,
            },
        ]).then(parseAIGeneratedJSON<InputAnalysisResult>);

        // 代码层面的数据验证
        if (typeof result.isValid !== "boolean") {
            throw new Error("阶段1：isValid 字段类型错误");
        }

        if (typeof result.isEmpty !== "boolean") {
            throw new Error("阶段1：isEmpty 字段类型错误");
        }

        if (typeof result.isNaturalLanguage !== "boolean") {
            throw new Error("阶段1：isNaturalLanguage 字段类型错误");
        }

        // 确保 reason 字段存在
        if (typeof result.reason !== "string") {
            result.reason = "";
        }

        return result;
    } catch (error) {
        log.error("Stage 1 failed", { error });
        // 失败时抛出错误，包含 reason
        throw new Error("输入分析失败：无法识别输入类型或语言");
    }
}
