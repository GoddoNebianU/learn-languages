export type TSharedFolder = {
    id: number,
    name: string,
    userId: string;
};

export type TSharedFolderWithTotalPairs = {
    id: number,
    name: string,
    userId: string,
    total: number;
};

export type TSharedPair = {
    text1: string;
    text2: string;
    language1: string;
    language2: string;
    ipa1: string | null;
    ipa2: string | null;
    id: number;
    folderId: number;
};