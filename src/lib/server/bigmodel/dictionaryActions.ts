"use server";

import { parseAIGeneratedJSON } from "@/lib/utils";
import { getAnswer } from "./zhipu";
import { createLookUp, createPhrase, createWord, selectLastLookUp } from "../services/dictionaryService";
import { DictLookUpRequest, DictWordResponse, isDictErrorResponse, isDictPhraseResponse, isDictWordResponse, type DictLookUpResponse } from "@/lib/shared";

const saveResult = async (req: DictLookUpRequest, res: DictLookUpResponse) => {
    if (isDictErrorResponse(res)) return;
    else if (isDictPhraseResponse(res)) {
        return createPhrase({
            standardForm: res.standardForm,
            queryLang: req.queryLang,
            definitionLang: req.definitionLang,
            lookups: {
                create: {
                    user: req.userId ? {
                        connect: {
                            id: req.userId
                        }
                    } : undefined,
                    text: req.text,
                    queryLang: req.queryLang,
                    definitionLang: req.definitionLang
                }
            },
            entries: {
                createMany: {
                    data: res.entries
                }
            }
        });
    } else if (isDictWordResponse(res)) {
        return createWord({
            standardForm: (res as DictWordResponse).standardForm,
            queryLang: req.queryLang,
            definitionLang: req.definitionLang,
            lookups: {
                create: {
                    user: req.userId ? {
                        connect: {
                            id: req.userId
                        }
                    } : undefined,
                    text: req.text,
                    queryLang: req.queryLang,
                    definitionLang: req.definitionLang
                }
            },
            entries: {
                createMany: {
                    data: (res as DictWordResponse).entries
                }
            }
        });
    }
};

export const lookUp = async ({
    text,
    queryLang,
    definitionLang,
    userId,
    forceRelook = false
}: DictLookUpRequest): Promise<DictLookUpResponse> => {
    try {
        const lastLookUp = await selectLastLookUp({
            text,
            queryLang,
            definitionLang
        });
        if (forceRelook || !lastLookUp) {
            const response = await getAnswer([
                {
                    role: "system",
                    content: `
你是一个词典工具，返回单词或短语的 JSON 解释结果。

查询语言：${queryLang}
释义语言：${definitionLang}

用户输入在 <text> 标签内，判断是单词还是短语。

语言规则：

若输入语言与查询语言一致，直接查询。

若不一致但语义清晰（如“吃”“跑”“睡觉”），先理解其语义，再映射到查询语言中最常见、最标准的对应词或短语（如 查询语言=意大利语，输入“吃” → mangiare）。

若语义不清晰或存在明显歧义，视为无效输入。

standardForm 规则：
返回查询语言下的标准形式（英语动词原形、日语基本形、罗曼语族不定式等）。如无法确定，则与输入相同。

有效输入时返回：
{
"standardForm": "标准形式",
"entries": [...]
}

单词条目格式：
{
"ipa": "音标（如适用）",
"definition": "释义（使用 ${definitionLang}）",
"partOfSpeech": "词性",
"example": "例句（使用 ${queryLang}）"
}

短语条目格式：
{
"definition": "释义（使用 ${definitionLang}）",
"example": "例句（使用 ${queryLang}）"
}

无效输入返回：
{
"error": "错误信息（使用 ${definitionLang}）"
}

只输出 JSON，不附加任何解释性文字。
            `.trim()
                }, {
                    role: "user",
                    content: `<text>${text}</text>请处理text标签内的内容后返回给我json`
                }
            ]).then(parseAIGeneratedJSON<DictLookUpResponse>);
            saveResult({
                text,
                queryLang,
                definitionLang,
                userId,
                forceRelook
            }, response);
            return response;
        } else {
            if (lastLookUp.dictionaryWordId) {
                createLookUp({
                    user: userId ? {
                        connect: {
                            id: userId
                        }
                    } : undefined,
                    text: text,
                    queryLang: queryLang,
                    definitionLang: definitionLang,
                    dictionaryWord: {
                        connect: {
                            id: lastLookUp.dictionaryWordId,
                        }
                    }
                });
                return {
                    standardForm: lastLookUp.dictionaryWord!.standardForm,
                    entries: lastLookUp.dictionaryWord!.entries
                };
            } else if (lastLookUp.dictionaryPhraseId) {
                createLookUp({
                    user: userId ? {
                        connect: {
                            id: userId
                        }
                    } : undefined,
                    text: text,
                    queryLang: queryLang,
                    definitionLang: definitionLang,
                    dictionaryPhrase: {
                        connect: {
                            id: lastLookUp.dictionaryPhraseId
                        }
                    }
                });
                return {
                    standardForm: lastLookUp.dictionaryPhrase!.standardForm,
                    entries: lastLookUp.dictionaryPhrase!.entries
                };
            } else {
                return { error: "Database structure error!" };
            }
        }
    } catch (error) {
        console.log(error);
        return { error: "LOOK_UP_ERROR" };
    }
};
