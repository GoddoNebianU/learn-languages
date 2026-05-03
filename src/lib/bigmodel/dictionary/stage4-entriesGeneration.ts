import { getAnswer } from "../llm";
import { parseAIGeneratedJSON } from "@/utils/json";
import { stripIpaBrackets } from "@/utils/string";
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
只收录该词条最常见的核心义项，遵循以下原则：
${
  isWord
    ? `- 按词性分组，每种词性只保留 1-2 个最常用义项
- 同一词性下含义相近的义项必须合并为一条
- 仅收录日常用语和通用含义，不收录冷僻义、罕见习语、专业术语
- 总条目数控制在 2-6 条`
    : `- 只保留最核心的 2-4 个含义
- 含义相近的义项合并为一条
- 不收录罕见用法`
}

【JSON格式】
${isWord ? `{"entries":[{"ipa":"国际音标","partOfSpeech":"词性","definition":"详细释义","example":"自然例句"}]}` : `{"entries":[{"definition":"详细释义","example":"自然例句"}]}`}

【质量标准】
- 释义：准确、简洁，突出最核心的含义
- 例句：自然、地道、展示最常见的实际用法
- IPA：使用标准国际音标（单词/短语必填）
- 宁缺毋滥：宁可少一条，也不要生成冗余或牵强的释义

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
        entry.ipa = stripIpaBrackets(entry.ipa);
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
    log.error("Entries generation failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
