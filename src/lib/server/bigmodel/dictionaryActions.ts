"use server";

import { parseAIGeneratedJSON } from "@/lib/utils";
import { getAnswer } from "./zhipu";

type DictionaryWordEntry = {
    ipa: string;
    definition: string;
    partOfSpeech: string;
    example: string;
};

type DictionaryPhraseEntry = {
    definition: string;
    example: string;
};

type DictionaryErrorResponse = {
    error: string;
};

type DictionarySuccessResponse = {
    standardForm: string;
    entries: (DictionaryWordEntry | DictionaryPhraseEntry)[];
};

export const lookUp = async (
    text: string,
    queryLang: string,
    definitionLang: string
): Promise<DictionarySuccessResponse | DictionaryErrorResponse> => {
    const response = await getAnswer([
        {
            role: "system",
            content: `
你是一个词典工具，返回单词/短语的JSON解释。

查询语言：${queryLang}
释义语言：${definitionLang}

用户输入在<text>标签内。判断是单词还是短语。

如果输入有效，返回JSON对象，格式为：
{
  "standardForm": "字符串，该语言下的正确形式",
  "entries": [数组，包含一个或多个条目]
}

如果是单词，条目格式：
{
  "ipa": "音标（如适用）",
  "definition": "释义",
  "partOfSpeech": "词性",
  "example": "例句"
}

如果是短语，条目格式：
{
  "definition": "短语释义",
  "example": "例句"
}

所有释义内容使用${definitionLang}语言。
例句使用${queryLang}语言。

如果输入无效（如：输入为空、包含非法字符、无法识别的语言等），返回JSON对象：
{
  "error": "错误描述信息，使用${definitionLang}语言"
}

提供standardForm时：尝试修正笔误或返回原形（如英语动词原形、日语基本形等）。若无法确定或输入正确，则与输入相同。

示例：
英语输入"ran" -> standardForm: "run"
中文输入"跑眬" -> standardForm: "跑"
日语输入"走った" -> standardForm: "走る"

短语同理，尝试返回其标准/常见形式。

现在处理用户输入。
            `.trim()
        }, {
            role: "user",
            content: `<text>${text}</text>请处理text标签内的内容后返回给我json`
        }
    ]);

    const result = parseAIGeneratedJSON<
        DictionaryErrorResponse |
        {
            standardForm: string,
            entries: DictionaryPhraseEntry[];
        } |
        {
            standardForm: string,
            entries: DictionaryWordEntry[];
        }>(response);

    return result;
};
