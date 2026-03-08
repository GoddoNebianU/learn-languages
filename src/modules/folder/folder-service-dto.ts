import { Visibility } from "../../../generated/prisma/enums";

export type ServiceInputCreateFolder = {
  name: string;
  userId: string;
};

export type ServiceInputRenameFolder = {
  folderId: number;
  newName: string;
};

export type ServiceInputDeleteFolder = {
  folderId: number;
};

export type ServiceInputSetVisibility = {
  folderId: number;
  visibility: Visibility;
};

export type ServiceInputCheckOwnership = {
  folderId: number;
  userId: string;
};

export type ServiceInputCheckPairOwnership = {
  pairId: number;
  userId: string;
};

export type ServiceInputCreatePair = {
  folderId: number;
  text1: string;
  text2: string;
  language1: string;
  language2: string;
};

export type ServiceInputUpdatePair = {
  pairId: number;
  text1?: string;
  text2?: string;
  language1?: string;
  language2?: string;
};

export type ServiceInputDeletePair = {
  pairId: number;
};

export type ServiceInputGetPublicFolders = {
  limit?: number;
  offset?: number;
};

export type ServiceInputSearchPublicFolders = {
  query: string;
  limit?: number;
};

export type ServiceInputToggleFavorite = {
  folderId: number;
  userId: string;
};

export type ServiceInputCheckFavorite = {
  folderId: number;
  userId: string;
};

export type ServiceInputGetUserFavorites = {
  userId: string;
  limit?: number;
  offset?: number;
};

export type ServiceOutputFolder = {
  id: number;
  name: string;
  visibility: Visibility;
  createdAt: Date;
  userId: string;
};

export type ServiceOutputFolderWithDetails = ServiceOutputFolder & {
  userName: string | null;
  userUsername: string | null;
  totalPairs: number;
  favoriteCount: number;
};

export type ServiceOutputFavoriteStatus = {
  isFavorited: boolean;
  favoriteCount: number;
};

export type ServiceOutputUserFavorite = {
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
