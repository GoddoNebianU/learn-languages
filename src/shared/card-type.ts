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
