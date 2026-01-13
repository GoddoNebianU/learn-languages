import { executeDictionaryLookup } from "@/lib/bigmodel/dictionary";
import { createLookUp, createLookUpWithItemAndEntries, selectLastLookUpResult } from "./dictionary-repository";
import { LookUpServiceInputDto } from "./dictionary-service-dto";

export const lookUpService = async (dto: LookUpServiceInputDto) => {
    const {
        text,
        queryLang,
        userId,
        definitionLang,
        forceRelook
    } = dto;

    const lastLookUpResult = await selectLastLookUpResult({
        text,
        queryLang,
        definitionLang,
    });

    if (forceRelook || !lastLookUpResult) {
        const response = await executeDictionaryLookup(
            text,
            queryLang,
            definitionLang
        );

        // 使用事务确保数据一致性
        createLookUpWithItemAndEntries(
            {
                standardForm: response.standardForm,
                queryLang,
                definitionLang
            },
            {
                userId,
                text,
                queryLang,
                definitionLang,
            },
            response.entries
        ).catch(error => {
            console.error('Failed to save dictionary data:', error);
        });

        return response;
    } else {
        createLookUp({
            userId: userId,
            text: text,
            queryLang: queryLang,
            definitionLang: definitionLang,
            dictionaryItemId: lastLookUpResult.id
        }).catch(error => {
            console.error('Failed to save dictionary data:', error);
        });
        return {
            standardForm: lastLookUpResult.standardForm,
            entries: lastLookUpResult.entries
        };
    }
};