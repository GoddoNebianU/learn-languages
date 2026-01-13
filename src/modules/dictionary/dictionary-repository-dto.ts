import { TSharedItem } from "@/shared";

export type CreateDictionaryLookUpInputDto = {
    userId?: string;
    text: string;
    queryLang: string;
    definitionLang: string;
    dictionaryItemId?: number;
};

export type SelectLastLookUpResultOutputDto = TSharedItem & {id: number} | null;

export type CreateDictionaryItemInputDto = {
    standardForm: string;
    queryLang: string;
    definitionLang: string;
};

export type CreateDictionaryEntryInputDto = {
    itemId: number;
    ipa?: string;
    definition: string;
    partOfSpeech?: string;
    example: string;
};

export type CreateDictionaryEntryWithoutItemIdInputDto = {
    ipa?: string;
    definition: string;
    partOfSpeech?: string;
    example: string;
};

export type SelectLastLookUpResultInputDto = {
    text: string,
    queryLang: string,
    definitionLang: string;
};
