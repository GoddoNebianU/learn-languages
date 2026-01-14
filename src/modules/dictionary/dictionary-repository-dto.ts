import { TSharedItem } from "@/shared";

export type RepoInputCreateDictionaryLookUp = {
    userId?: string;
    text: string;
    queryLang: string;
    definitionLang: string;
    dictionaryItemId?: number;
};

export type RepoOutputSelectLastLookUpResult = TSharedItem & {id: number} | null;

export type RepoInputCreateDictionaryItem = {
    standardForm: string;
    queryLang: string;
    definitionLang: string;
};

export type RepoInputCreateDictionaryEntry = {
    itemId: number;
    ipa?: string;
    definition: string;
    partOfSpeech?: string;
    example: string;
};

export type RepoInputCreateDictionaryEntryWithoutItemId = {
    ipa?: string;
    definition: string;
    partOfSpeech?: string;
    example: string;
};

export type RepoInputSelectLastLookUpResult = {
    text: string,
    queryLang: string,
    definitionLang: string;
};
