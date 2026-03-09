import { getAnswer } from "../zhipu";
import { parseAIGeneratedJSON } from "@/utils/json";
import { EntriesGenerationResult } from "./types";
import { createLogger } from "@/lib/logger";

const log = createLogger("dictionary-entries");

export async function generateEntries(
    standardForm: string,
    queryLang: string,
    definitionLang: string,
    inputType: "word" | "phrase"
): Promise<EntriesGenerationResult> {
    const isWord = inputType === "word";

    const prompt = `
生成词典条目。词语："${standardForm}"（${queryLang}）。用${definitionLang}释义。

返回 JSON：
${isWord ? `{"entries":[{"ipa":"音标","partOfSpeech":"词性","definition":"释义","example":"例句"}]}` : `{"entries":[{"definition":"释义","example":"例句"}]}`}

只返回 JSON。
`.trim();

    try {
        const result = await getAnswer([
            { role: "system", content: "词典条目生成器，只返回 JSON。" },
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

        return result;
    } catch (error) {
        log.error("Entries generation failed", { error: error instanceof Error ? error.message : String(error) });
        throw error;
    }
}
