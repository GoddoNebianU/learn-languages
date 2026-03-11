export type RepoInputCreateDictionaryLookUp = {
    userId?: string;
    text: string;
    queryLang: string;
    definitionLang: string;
    dictionaryItemId?: number;
};

export type RepoOutputSelectLastLookUpResultEntry = {
    id: number;
    itemId: number;
    ipa: string | null;
    definition: string;
    partOfSpeech: string | null;
    example: string;
    createdAt: Date;
    updatedAt: Date;
};

export type RepoOutputSelectLastLookUpResultItem = {
    id: number;
    frequency: number;
    standardForm: string;
    queryLang: string;
    definitionLang: string;
    createdAt: Date;
    updatedAt: Date;
    entries: RepoOutputSelectLastLookUpResultEntry[];
};

export type RepoOutputSelectLastLookUpResult = RepoOutputSelectLastLookUpResultItem | null;

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
