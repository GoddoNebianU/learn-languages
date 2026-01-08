"use server";

import { executeDictionaryLookup } from "./dictionary";
import { createLookUp, createPhrase, createWord, createPhraseEntry, createWordEntry, selectLastLookUp } from "../services/dictionaryService";
import { DictLookUpRequest, DictWordResponse, isDictErrorResponse, isDictPhraseResponse, isDictWordResponse, type DictLookUpResponse } from "@/lib/shared";
import { text } from "node:stream/consumers";

const saveResult = async (req: DictLookUpRequest, res: DictLookUpResponse) => {
    if (isDictErrorResponse(res)) return;
    else if (isDictPhraseResponse(res)) {
        // 先创建 Phrase
        const phrase = await createPhrase({
            standardForm: res.standardForm,
            queryLang: req.queryLang,
            definitionLang: req.definitionLang,
        });

        // 创建 Lookup
        await createLookUp({
            userId: req.userId,
            text: req.text,
            queryLang: req.queryLang,
            definitionLang: req.definitionLang,
            dictionaryPhraseId: phrase.id,
        });

        // 创建 Entries
        for (const entry of res.entries) {
            await createPhraseEntry({
                phraseId: phrase.id,
                definition: entry.definition,
                example: entry.example,
            });
        }
    } else if (isDictWordResponse(res)) {
        // 先创建 Word
        const word = await createWord({
            standardForm: (res as DictWordResponse).standardForm,
            queryLang: req.queryLang,
            definitionLang: req.definitionLang,
        });

        // 创建 Lookup
        await createLookUp({
            userId: req.userId,
            text: req.text,
            queryLang: req.queryLang,
            definitionLang: req.definitionLang,
            dictionaryWordId: word.id,
        });

        // 创建 Entries
        for (const entry of (res as DictWordResponse).entries) {
            await createWordEntry({
                wordId: word.id,
                ipa: entry.ipa,
                definition: entry.definition,
                partOfSpeech: entry.partOfSpeech,
                example: entry.example,
            });
        }
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
export const lookUp = async (req: DictLookUpRequest): Promise<DictLookUpResponse> => {
    const {
        text,
        queryLang,
        forceRelook = false,
        definitionLang,
        userId
    } = req;

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
                    userId: userId,
                    text: text,
                    queryLang: queryLang,
                    definitionLang: definitionLang,
                    dictionaryWordId: lastLookUp.dictionaryWordId,
                });
                return {
                    standardForm: lastLookUp.dictionaryWord!.standardForm,
                    entries: lastLookUp.dictionaryWord!.entries
                };
            } else if (lastLookUp.dictionaryPhraseId) {
                createLookUp({
                    userId: userId,
                    text: text,
                    queryLang: queryLang,
                    definitionLang: definitionLang,
                    dictionaryPhraseId: lastLookUp.dictionaryPhraseId
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
        return { error: "look up error" };
    }
};
