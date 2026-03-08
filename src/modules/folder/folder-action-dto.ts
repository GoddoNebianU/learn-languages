import { LENGTH_MAX_FOLDER_NAME, LENGTH_MAX_IPA, LENGTH_MAX_LANGUAGE, LENGTH_MAX_PAIR_TEXT, LENGTH_MIN_FOLDER_NAME, LENGTH_MIN_IPA, LENGTH_MIN_LANGUAGE, LENGTH_MIN_PAIR_TEXT } from "@/shared/constant";
import { TSharedFolderWithTotalPairs } from "@/shared/folder-type";
import { generateValidator } from "@/utils/validate";
import z from "zod";

export const schemaActionInputCreatePair = z.object({
    text1: z.string().min(LENGTH_MIN_PAIR_TEXT).max(LENGTH_MAX_PAIR_TEXT),
    text2: z.string().min(LENGTH_MIN_PAIR_TEXT).max(LENGTH_MAX_PAIR_TEXT),
    language1: z.string().min(LENGTH_MIN_LANGUAGE).max(LENGTH_MAX_LANGUAGE),
    language2: z.string().min(LENGTH_MIN_LANGUAGE).max(LENGTH_MAX_LANGUAGE),
    ipa1: z.string().min(LENGTH_MIN_IPA).max(LENGTH_MAX_IPA).optional(),
    ipa2: z.string().min(LENGTH_MIN_IPA).max(LENGTH_MAX_IPA).optional(),
    folderId: z.int()
});
export type ActionInputCreatePair = z.infer<typeof schemaActionInputCreatePair>;
export const validateActionInputCreatePair = generateValidator(schemaActionInputCreatePair);

export const schemaActionInputUpdatePairById = z.object({
    text1: z.string().min(LENGTH_MIN_PAIR_TEXT).max(LENGTH_MAX_PAIR_TEXT).optional(),
    text2: z.string().min(LENGTH_MIN_PAIR_TEXT).max(LENGTH_MAX_PAIR_TEXT).optional(),
    language1: z.string().min(LENGTH_MIN_LANGUAGE).max(LENGTH_MAX_LANGUAGE).optional(),
    language2: z.string().min(LENGTH_MIN_LANGUAGE).max(LENGTH_MAX_LANGUAGE).optional(),
    ipa1: z.string().min(LENGTH_MIN_IPA).max(LENGTH_MAX_IPA).optional(),
    ipa2: z.string().min(LENGTH_MIN_IPA).max(LENGTH_MAX_IPA).optional(),
    folderId: z.int().optional()
});
export type ActionInputUpdatePairById = z.infer<typeof schemaActionInputUpdatePairById>;
export const validateActionInputUpdatePairById = generateValidator(schemaActionInputUpdatePairById);

export type ActionOutputGetFoldersWithTotalPairsByUserId = {
    message: string,
    success: boolean,
    data?: TSharedFolderWithTotalPairs[];
};

export const schemaActionInputSetFolderVisibility = z.object({
    folderId: z.number().int().positive(),
    visibility: z.enum(["PRIVATE", "PUBLIC"]),
});
export type ActionInputSetFolderVisibility = z.infer<typeof schemaActionInputSetFolderVisibility>;

export const schemaActionInputSearchPublicFolders = z.object({
    query: z.string().min(1).max(100),
});
export type ActionInputSearchPublicFolders = z.infer<typeof schemaActionInputSearchPublicFolders>;

export type ActionOutputPublicFolder = {
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

export type ActionOutputGetPublicFolders = {
    message: string;
    success: boolean;
    data?: ActionOutputPublicFolder[];
};

export type ActionOutputSetFolderVisibility = {
    message: string;
    success: boolean;
};

export type ActionOutputToggleFavorite = {
    message: string;
    success: boolean;
    data?: {
        isFavorited: boolean;
        favoriteCount: number;
    };
};

export type ActionOutputCheckFavorite = {
    message: string;
    success: boolean;
    data?: {
        isFavorited: boolean;
        favoriteCount: number;
    };
};

export type ActionOutputUserFavorite = {
    id: number;
    folderId: number;
    folderName: string;
    folderCreatedAt: Date;
    folderTotalPairs: number;
    folderOwnerId: string;
    folderOwnerName: string | null;
    folderOwnerUsername: string | null;
    favoritedAt: Date;
};

export type ActionOutputGetUserFavorites = {
    message: string;
    success: boolean;
    data?: ActionOutputUserFavorite[];
};
