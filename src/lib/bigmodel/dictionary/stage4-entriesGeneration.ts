import { getAnswer } from "../zhipu";
import { parseAIGeneratedJSON } from "@/utils/json";
import { EntriesGenerationResult } from "./types";

/**
 * 阶段 4：释义与词条生成
 *
 * 独立的 LLM 调用，生成词典条目
 */

export async function generateEntries(
    standardForm: string,
    queryLang: string,
    definitionLang: string,
    inputType: "word" | "phrase"
): Promise<EntriesGenerationResult> {
    const isWord = inputType === "word";

    const prompt = `
你是一个词典条目生成器。为标准形式生成词典条目。

标准形式：${standardForm}
查询语言：${queryLang}
释义语言：${definitionLang}
词条类型：${isWord ? "单词" : "短语"}

${isWord ? `
单词条目要求：
- ipa：音标（如适用）
- partOfSpeech：词性
- definition：释义（使用 ${definitionLang}）
- example：例句（使用 ${queryLang}）
` : `
短语条目要求：
- definition：短语释义（使用 ${definitionLang}）
- example：例句（使用 ${queryLang}）
`}

生成 1-3 个条目，返回 JSON 格式：
{
  "entries": [
    ${isWord ? `
    {
      "ipa": "音标",
      "partOfSpeech": "词性",
      "definition": "释义",
      "example": "例句"
    }` : `
    {
      "definition": "释义",
      "example": "例句"
    }`}
  ]
}

只返回 JSON，不要任何其他文字。
`.trim();

    try {
        const result = await getAnswer([
            {
                role: "system",
                content: `你是一个词典条目生成器，只返回 JSON 格式的结果。`,
            },
            {
                role: "user",
                content: prompt,
            },
        ]).then(parseAIGeneratedJSON<EntriesGenerationResult>);

        // 代码层面的数据验证
        if (!result.entries || !Array.isArray(result.entries) || result.entries.length === 0) {
            throw new Error("阶段4：entries 为空或不是数组");
        }

        // 处理每个条目，清理 IPA 格式
        for (const entry of result.entries) {
            // 清理 IPA：删除两端可能包含的方括号、斜杠等字符
            if (entry.ipa) {
                entry.ipa = entry.ipa.trim();
                // 删除开头的 [ / /
                entry.ipa = entry.ipa.replace(/^[\[\/]/, '');
                // 删除结尾的 ] / /
                entry.ipa = entry.ipa.replace(/[\]\/]$/, '');
            }

            if (!entry.definition || entry.definition.trim().length === 0) {
                throw new Error("阶段4：条目缺少 definition");
            }

            if (!entry.example || entry.example.trim().length === 0) {
                throw new Error("阶段4：条目缺少 example");
            }

            if (isWord && !entry.partOfSpeech) {
                throw new Error("阶段4：单词条目缺少 partOfSpeech");
            }

            if (isWord && !entry.ipa) {
                throw new Error("阶段4：单词条目缺少 ipa");
            }
        }

        return result;
    } catch (error) {
        console.error("阶段4失败：", error);
        throw error; // 阶段4失败应该返回错误，因为这个阶段是核心
    }
}
