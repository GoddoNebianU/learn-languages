import { executeDictionaryLookup } from "@/lib/bigmodel/dictionary";
import { repoCreateLookUp, repoCreateLookUpWithItemAndEntries, repoSelectLastLookUpResult } from "./dictionary-repository";
import { ServiceInputLookUp } from "./dictionary-service-dto";

export const serviceLookUp = async (dto: ServiceInputLookUp) => {
    const {
        text,
        queryLang,
        userId,
        definitionLang,
        forceRelook
    } = dto;

    const lastLookUpResult = await repoSelectLastLookUpResult({
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
        repoCreateLookUpWithItemAndEntries(
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
        repoCreateLookUp({
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