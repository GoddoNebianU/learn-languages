export type DictionaryItemEntry = {
  id: number;
  itemId: number;
  ipa: string | null;
  definition: string;
  partOfSpeech: string | null;
  example: string;
  createdAt: Date;
  updatedAt: Date;
};

export type DictionaryItemWithEntries = {
  id: number;
  frequency: number;
  standardForm: string;
  queryLang: string;
  definitionLang: string;
  createdAt: Date;
  updatedAt: Date;
  entries: DictionaryItemEntry[];
};

export type CardSide = "A" | "B";

export type CardForStudy = {
  id: number;
  deckId: number;
  showSideAFirst: boolean;
  sideA: DictionaryItemWithEntries;
  sideB: DictionaryItemWithEntries;
  createdAt: Date;
  updatedAt: Date;
};
