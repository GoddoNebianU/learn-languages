import { getAnswer } from "../zhipu";
import { parseAIGeneratedJSON } from "@/lib/utils";
import { SemanticMappingResult } from "./types";

/**
 * 阶段 2：跨语言语义映射决策
 *
 * 独立的 LLM 调用，决定是否需要语义映射
 * 如果输入不符合"明确、基础、可词典化的语义概念"且语言不一致，直接返回失败
 */

export async function determineSemanticMapping(
    text: string,
    queryLang: string,
    inputLanguage: string
): Promise<SemanticMappingResult> {
    // 如果输入语言就是查询语言，不需要映射
    if (inputLanguage.toLowerCase() === queryLang.toLowerCase()) {
        return {
            shouldMap: false,
            reason: "输入语言与查询语言一致",
        };
    }

    const prompt = `
你是一个语义映射决策器。判断是否需要对输入进行跨语言语义映射。

查询语言：${queryLang}
输入语言：${inputLanguage}
用户输入：${text}

判断规则：
1. 若输入表达一个**明确、基础、可词典化的语义概念**（如常见动词、名词、形容词），则应该映射
2. 若输入不符合上述条件（如复杂句子、专业术语、无法确定语义的词汇），则不应该映射

映射条件必须同时满足：
a) 输入语言 ≠ 查询语言
b) 输入是明确、基础、可词典化的语义概念

例如：
- 查询语言=English，输入="吃"（中文）→ 应该映射 → coreSemantic="to eat"
- 查询语言=Italiano，输入="run"（English）→ 应该映射 → coreSemantic="correre"
- 查询语言=中文，输入="hello"（English）→ 应该映射 → coreSemantic="你好"
- 查询语言=English，输入="我喜欢吃苹果"（中文，复杂句子）→ 不应该映射 → canMap=false

返回 JSON 格式：
{
  "shouldMap": true/false,
  "canMap": true/false,
  "coreSemantic": "提取的核心语义（用${queryLang}表达）",
  "mappedQuery": "映射到${queryLang}的标准表达",
  "reason": "错误原因，成功时为空字符串\"\""
}

- canMap=true 表示输入符合"明确、基础、可词典化的语义概念"
- shouldMap=true 表示需要进行映射
- 只有 canMap=true 且语言不一致时，shouldMap 才为 true
- 如果 shouldMap=false，在 reason 中说明原因
- 如果 shouldMap=true，reason 为空字符串 ""

只返回 JSON，不要任何其他文字。
`.trim();

    try {
        const result = await getAnswer([
            {
                role: "system",
                content: `你是一个语义映射决策器，只返回 JSON 格式的结果。`,
            },
            {
                role: "user",
                content: prompt,
            },
        ]).then(parseAIGeneratedJSON<any>);

        // 代码层面的数据验证
        if (typeof result.shouldMap !== "boolean") {
            throw new Error("阶段2：shouldMap 字段类型错误");
        }

        // 确保 reason 字段存在
        if (typeof result.reason !== "string") {
            result.reason = "";
        }

        // 如果不应该映射，返回错误
        if (!result.shouldMap) {
            throw new Error(result.reason || "输入不符合可词典化的语义概念，无法进行跨语言查询");
        }

        if (!result.mappedQuery || result.mappedQuery.trim().length === 0) {
            throw new Error("语义映射失败：映射结果为空");
        }

        return {
            shouldMap: result.shouldMap,
            coreSemantic: result.coreSemantic,
            mappedQuery: result.mappedQuery,
            reason: result.reason,
        };
    } catch (error) {
        console.error("阶段2失败：", error);
        // 失败时直接抛出错误，让编排器返回错误响应
        throw error;
    }
}
