import { Visibility } from "../../../generated/prisma/enums";

export interface RepoInputCreateDeck {
  name: string;
  desc?: string;
  userId: string;
  visibility?: Visibility;
}

export interface RepoInputUpdateDeck {
  id: number;
  name?: string;
  desc?: string;
  visibility?: Visibility;
  collapsed?: boolean;
  newPerDay?: number;
  revPerDay?: number;
}

export interface RepoInputGetDeckById {
  id: number;
}

export interface RepoInputGetDecksByUserId {
  userId: string;
}

export interface RepoInputGetPublicDecks {
  limit?: number;
  offset?: number;
  orderBy?: "createdAt" | "name";
}

export interface RepoInputDeleteDeck {
  id: number;
}

export type RepoOutputDeck = {
  id: number;
  name: string;
  desc: string;
  userId: string;
  visibility: Visibility;
  collapsed: boolean;
  conf: unknown;
  newPerDay: number;
  revPerDay: number;
  createdAt: Date;
  updatedAt: Date;
  cardCount?: number;
};

export type RepoOutputPublicDeck = RepoOutputDeck & {
  userName: string | null;
  userUsername: string | null;
  favoriteCount: number;
};

export type RepoOutputDeckOwnership = {
  userId: string;
};

export interface RepoInputToggleDeckFavorite {
  deckId: number;
  userId: string;
}

export interface RepoInputCheckDeckFavorite {
  deckId: number;
  userId: string;
}

export interface RepoInputSearchPublicDecks {
  query: string;
  limit?: number;
  offset?: number;
}

export interface RepoInputGetPublicDeckById {
  deckId: number;
}

export type RepoOutputDeckFavorite = {
  isFavorited: boolean;
  favoriteCount: number;
};

export interface RepoInputGetUserFavoriteDecks {
  userId: string;
}

export type RepoOutputUserFavoriteDeck = RepoOutputPublicDeck & {
  favoritedAt: Date;
};
