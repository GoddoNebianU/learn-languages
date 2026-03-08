import { Visibility } from "../../../generated/prisma/enums";

export interface RepoInputCreateFolder {
  name: string;
  userId: string;
}

export interface RepoInputCreatePair {
  text1: string;
  text2: string;
  language1: string;
  language2: string;
  ipa1?: string;
  ipa2?: string;
  folderId: number;
}

export interface RepoInputUpdatePair {
  text1?: string;
  text2?: string;
  language1?: string;
  language2?: string;
  ipa1?: string;
  ipa2?: string;
}

export interface RepoInputUpdateFolderVisibility {
  folderId: number;
  visibility: Visibility;
}

export interface RepoInputSearchPublicFolders {
  query: string;
  limit?: number;
}

export interface RepoInputGetPublicFolders {
  limit?: number;
  offset?: number;
  orderBy?: "createdAt" | "name";
}

export type RepoOutputPublicFolder = {
  id: number;
  name: string;
  visibility: Visibility;
  createdAt: Date;
  userId: string;
  userName: string | null;
  userUsername: string | null;
  totalPairs: number;
  favoriteCount: number;
};

export type RepoOutputFolderVisibility = {
  visibility: Visibility;
  userId: string;
};

export interface RepoInputToggleFavorite {
  folderId: number;
  userId: string;
}

export interface RepoInputCheckFavorite {
  folderId: number;
  userId: string;
}

export type RepoOutputFavoriteStatus = {
  isFavorited: boolean;
  favoriteCount: number;
};

export interface RepoInputGetUserFavorites {
  userId: string;
  limit?: number;
  offset?: number;
}

export type RepoOutputUserFavorite = {
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
