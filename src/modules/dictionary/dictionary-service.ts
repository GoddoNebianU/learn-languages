import { executeDictionaryLookup } from "@/lib/bigmodel/dictionary/orchestrator";
import { repoCreateLookUp, repoCreateLookUpWithItemAndEntries, repoSelectLastLookUpResult } from "./dictionary-repository";
import { ServiceInputLookUp } from "./dictionary-service-dto";
import { createLogger } from "@/lib/logger";
import { RepoOutputSelectLastLookUpResultItem } from "./dictionary-repository-dto";

const log = createLogger("dictionary-service");

function transformRawItemToSharedItem(rawItem: RepoOutputSelectLastLookUpResultItem) {
    return {
        id: rawItem.id,
        standardForm: rawItem.standardForm,
        entries: rawItem.entries.map(entry => ({
            ipa: entry.ipa ?? undefined,
            definition: entry.definition,
            partOfSpeech: entry.partOfSpeech ?? undefined,
            example: entry.example
        }))
    };
}

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
            log.error("Failed to save dictionary data", { error: error instanceof Error ? error.message : String(error) });
        });

        return response;
    } else {
        const transformedResult = transformRawItemToSharedItem(lastLookUpResult);
        
        repoCreateLookUp({
            userId: userId,
            text: text,
            queryLang: queryLang,
            definitionLang: definitionLang,
            dictionaryItemId: transformedResult.id
        }).catch(error => {
            log.error("Failed to save dictionary data", { error: error instanceof Error ? error.message : String(error) });
        });
        return {
            standardForm: transformedResult.standardForm,
            entries: transformedResult.entries
        };
    }
};