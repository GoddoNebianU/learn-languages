import { Visibility } from "../../../generated/prisma/enums";

export type ServiceInputCreateDeck = {
  name: string;
  desc?: string;
  userId: string;
  visibility?: Visibility;
};

export type ServiceInputUpdateDeck = {
  deckId: number;
  name?: string;
  desc?: string;
  visibility?: Visibility;
};

export type ServiceInputDeleteDeck = {
  deckId: number;
};

export type ServiceInputGetDeckById = {
  deckId: number;
};

export type ServiceInputGetDecksByUserId = {
  userId: string;
};

export type ServiceInputGetPublicDecks = {
  limit?: number;
  offset?: number;
};

export type ServiceInputCheckOwnership = {
  deckId: number;
  userId: string;
};

export type ServiceOutputDeck = {
  id: number;
  name: string;
  desc: string;
  userId: string;
  visibility: Visibility;
  createdAt: Date;
  updatedAt: Date;
  cardCount?: number;
};

export type ServiceOutputPublicDeck = ServiceOutputDeck & {
  userName: string | null;
  userUsername: string | null;
  favoriteCount: number;
};

export type ServiceInputToggleDeckFavorite = {
  deckId: number;
  userId: string;
};

export type ServiceInputCheckDeckFavorite = {
  deckId: number;
  userId: string;
};

export type ServiceInputSearchPublicDecks = {
  query: string;
  limit?: number;
  offset?: number;
};

export type ServiceInputGetPublicDeckById = {
  deckId: number;
};

export type ServiceOutputDeckFavorite = {
  isFavorited: boolean;
  favoriteCount: number;
};

export type ServiceOutputUserFavoriteDeck = ServiceOutputPublicDeck & {
  favoritedAt: Date;
};
