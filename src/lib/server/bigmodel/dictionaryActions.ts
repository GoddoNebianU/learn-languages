"use server";

import { executeDictionaryLookup } from "./dictionary";
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

/**
 * 查询单词或短语
 *
 * 使用模块化的词典查询系统，将提示词拆分为6个阶段：
 * - 阶段0：基础系统提示
 * - 阶段1：输入解析与语言识别
 * - 阶段2：跨语言语义映射决策
 * - 阶段3：standardForm 生成与规范化
 * - 阶段4：释义与词条生成
 * - 阶段5：错误处理
 * - 阶段6：最终输出封装
 */
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
            // 使用新的模块化查询系统
            const response = await executeDictionaryLookup(
                text,
                queryLang,
                definitionLang
            );

            saveResult({
                text,
                queryLang,
                definitionLang,
                userId,
                forceRelook
            }, response);

            return response;
        } else {
            // 从数据库返回缓存的结果
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
