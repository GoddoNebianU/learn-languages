import { getAnswer } from "../llm";
import { parseAIGeneratedJSON } from "@/utils/json";
import { EntriesGenerationResult } from "./types";
import { createLogger } from "@/lib/logger";

const log = createLogger("dictionary-entries");

function escapeXml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

export async function generateEntries(
    standardForm: string,
    queryLang: string,
    definitionLang: string,
    inputType: "word" | "phrase"
): Promise<EntriesGenerationResult> {
    const isWord = inputType === "word";

    const prompt = `
你是专业词典编纂专家。为词条"${escapeXml(standardForm)}"（${queryLang}）生成${definitionLang}释义。

【核心要求】
生成尽可能完整、全面的词典条目，包括：
${isWord ? `- 所有常见词性（名词、动词、形容词、副词等）
- 每个词性下的所有常用义项
- 专业领域含义、口语含义、习语用法` : `- 所有常见含义和用法
- 字面义和引申义
- 不同语境下的解释`}

【JSON格式】
${isWord ? `{"entries":[{"ipa":"国际音标","partOfSpeech":"词性","definition":"详细释义","example":"自然例句"}]}` : `{"entries":[{"definition":"详细释义","example":"自然例句"}]}`}

【质量标准】
- 条目数量：尽可能多，不要遗漏常用义项
- 释义：准确、完整、符合母语者习惯
- 例句：自然、地道、展示实际用法
- IPA：使用标准国际音标（单词/短语必填）

只返回JSON，不要其他内容。
`.trim();

    try {
        const result = await getAnswer([
            { role: "system", content: "专业词典编纂专家，返回完整JSON词典数据。" },
            { role: "user", content: prompt },
        ]).then(parseAIGeneratedJSON<EntriesGenerationResult>);

        if (!result.entries?.length) {
            throw new Error("词条生成失败：结果为空");
        }

        for (const entry of result.entries) {
            if (entry.ipa) {
                entry.ipa = entry.ipa.trim().replace(/^[\[\/]/, '').replace(/[\]\/]$/, '');
            }
            if (!entry.definition?.trim()) {
                throw new Error("词条缺少释义");
            }
            if (!entry.example?.trim()) {
                throw new Error("词条缺少例句");
            }
            if (isWord && !entry.partOfSpeech) {
                throw new Error("单词条目缺少词性");
            }
        }

        log.info("Generated dictionary entries", { count: result.entries.length });
        return result;
    } catch (error) {
        log.error("Entries generation failed", { error: error instanceof Error ? error.message : String(error) });
        throw error;
    }
}
