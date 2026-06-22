export type CardMeaning = {
  partOfSpeech: string | null;
  definition: string;
  example?: string | null;
};

export const CardTypeEnum = {
  WORD: "WORD",
  PHRASE: "PHRASE",
  SENTENCE: "SENTENCE",
} as const;

export type CardType = keyof typeof CardTypeEnum;

export interface RepoInputCreateCard {
  deckId: number;
  word: string;
  ipa?: string | null;
  queryLang: string;
  cardType: CardType;
  meanings: CardMeaning[];
}

export interface RepoInputUpdateCard {
  cardId: number;
  word?: string;
  ipa?: string | null;
  meanings?: CardMeaning[];
  hidden?: boolean;
}

export interface RepoInputDeleteCard {
  cardId: number;
}

export interface RepoInputGetCardsByDeckId {
  deckId: number;
  limit?: number;
  offset?: number;
  includeHidden?: boolean;
}

export interface RepoInputGetRandomCard {
  deckId: number;
  excludeIds?: number[];
}

export interface RepoInputCheckCardOwnership {
  cardId: number;
  userId: string;
}

export interface RepoInputCheckCardExistsByWord {
  deckId: number;
  word: string;
}

export type RepoOutputCard = {
  id: number;
  deckId: number;
  word: string;
  ipa: string | null;
  queryLang: string;
  cardType: CardType;
  meanings: CardMeaning[];
  hidden: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type RepoOutputCardStats = {
  total: number;
};

export interface RepoInputReorderCards {
  deckId: number;
  cardIds: number[];
}
