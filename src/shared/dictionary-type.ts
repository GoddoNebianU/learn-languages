export type TSharedEntry = {
    definition: string,
    example: string,
    partOfSpeech?: string;
    ipa?: string;
};

export type TSharedItem = {
    id?: number;
    standardForm: string,
    entries: TSharedEntry[];
};