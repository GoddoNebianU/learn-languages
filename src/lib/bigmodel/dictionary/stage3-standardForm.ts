import { getAnswer } from "../zhipu";
import { parseAIGeneratedJSON } from "@/utils/json";
import { StandardFormResult } from "./types";

/**
 * 阶段 3：standardForm 生成与规范化
 *
 * 独立的 LLM 调用，生成标准形式
 */

export async function generateStandardForm(
    inputText: string,
    queryLang: string,
    originalInput?: string
): Promise<StandardFormResult> {
    const prompt = `
你是一个词典标准形式生成器。为输入生成该语言下的标准形式。

查询语言：${queryLang}
当前输入：${inputText}
${originalInput ? `原始输入（语义参考）：${originalInput}` : ''}

${originalInput ? `
**重要说明**：
- 当前输入是经过语义映射后的结果（从原始语言映射到查询语言）
- 原始输入提供了语义上下文，帮助你理解用户的真实查询意图
- 你需要基于**当前输入**生成标准形式，但要参考**原始输入的语义**以确保准确性

例如：
- 原始输入："吃"（中文），当前输入："to eat"（英语）→ 标准形式应为 "eat"
- 原始输入："走"（中文），当前输入："to walk"（英语）→ 标准形式应为 "walk"
` : ''}

规则：
1. 尝试修正明显拼写错误
2. 还原为该语言中**最常见、最自然、最标准**的形式：
   * 英语：动词原形、名词单数
   * 日语：辞书形
   * 意大利语：不定式或最常见规范形式
   * 维吾尔语：标准拉丁化或阿拉伯字母形式
   * 中文：标准简化字
3. ${originalInput ? '参考原始输入的语义，确保标准形式符合用户的真实查询意图':'若无法确定或输入本身已规范，则保持不变'}

返回 JSON 格式：
{
  "standardForm": "标准形式",
  "confidence": "high/medium/low",
  "reason": "错误原因，成功时为空字符串\"\""
}

成功生成标准形式时，reason 为空字符串 ""。
失败时，在 reason 中说明失败原因。
只返回 JSON，不要任何其他文字。
`.trim();

    try {
        const result = await getAnswer([
            {
                role: "system",
                content: "你是一个词典标准形式生成器，只返回 JSON 格式的结果。",
            },
            {
                role: "user",
                content: prompt,
            },
        ]).then(parseAIGeneratedJSON<any>);

        // 代码层面的数据验证
        if (!result.standardForm || result.standardForm.trim().length === 0) {
            throw new Error(result.reason || "阶段3：standardForm 为空");
        }

        // 处理 confidence 可能是中文或英文的情况
        let confidence: "high" | "medium" | "low" = "low";
        const confidenceValue = result.confidence?.toLowerCase();
        if (confidenceValue === "高" || confidenceValue === "high") {
            confidence = "high";
        } else if (confidenceValue === "中" || confidenceValue === "medium") {
            confidence = "medium";
        } else if (confidenceValue === "低" || confidenceValue === "low") {
            confidence = "low";
        }

        // 确保 reason 字段存在
        const reason = typeof result.reason === "string" ? result.reason : "";

        return {
            standardForm: result.standardForm,
            confidence,
            reason,
        };
    } catch (error) {
        console.error("阶段3失败：", error);
        // 失败时抛出错误
        throw error;
    }
}
