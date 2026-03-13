import { CardType, CardQueue } from "../../../generated/prisma/enums";

export interface RepoInputCreateCard {
  id: bigint;
  noteId: bigint;
  deckId: number;
  ord: number;
  due: number;
  type?: CardType;
  queue?: CardQueue;
  ivl?: number;
  factor?: number;
  reps?: number;
  lapses?: number;
  left?: number;
  odue?: number;
  odid?: number;
  flags?: number;
  data?: string;
}

export interface RepoInputUpdateCard {
  ord?: number;
  mod?: number;
  usn?: number;
  type?: CardType;
  queue?: CardQueue;
  due?: number;
  ivl?: number;
  factor?: number;
  reps?: number;
  lapses?: number;
  left?: number;
  odue?: number;
  odid?: number;
  flags?: number;
  data?: string;
}

export interface RepoInputGetCardsByDeckId {
  deckId: number;
  limit?: number;
  offset?: number;
  queue?: CardQueue | CardQueue[];
}

export interface RepoInputGetCardsForReview {
  deckId: number;
  limit?: number;
}

export interface RepoInputGetNewCards {
  deckId: number;
  limit?: number;
}

export interface RepoInputBulkUpdateCard {
  id: bigint;
  data: RepoInputUpdateCard;
}

export interface RepoInputBulkUpdateCards {
  cards: RepoInputBulkUpdateCard[];
}

export type RepoOutputCard = {
  id: bigint;
  noteId: bigint;
  deckId: number;
  ord: number;
  mod: number;
  usn: number;
  type: CardType;
  queue: CardQueue;
  due: number;
  ivl: number;
  factor: number;
  reps: number;
  lapses: number;
  left: number;
  odue: number;
  odid: number;
  flags: number;
  data: string;
  createdAt: Date;
  updatedAt: Date;
};

export type RepoOutputCardWithNote = RepoOutputCard & {
  note: {
    id: bigint;
    flds: string;
    sfld: string;
    tags: string;
  };
};

export type RepoOutputCardStats = {
  total: number;
  new: number;
  learning: number;
  review: number;
  due: number;
};

export interface RepoInputResetDeckCards {
  deckId: number;
}

export type RepoOutputResetDeckCards = {
  count: number;
};
