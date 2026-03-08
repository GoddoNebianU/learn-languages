export type TSharedFolder = {
    id: number,
    name: string,
    userId: string;
    visibility: "PRIVATE" | "PUBLIC";
};

export type TSharedFolderWithTotalPairs = {
    id: number,
    name: string,
    userId: string,
    visibility: "PRIVATE" | "PUBLIC";
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

export type TPublicFolder = {
    id: number;
    name: string;
    visibility: "PRIVATE" | "PUBLIC";
    createdAt: Date;
    userId: string;
    userName: string | null;
    userUsername: string | null;
    totalPairs: number;
    favoriteCount: number;
};