export type TSharedEntry = {
    definition: string,
    example: string,
    partOfSpeech?: string;
    ipa?: string;
};

export type TSharedItem = {
    standardForm: string,
    entries: TSharedEntry[];
};