export interface DictionaryContext {
  queryLang: string;
  definitionLang: string;
}

export interface PreprocessResult {
  isValid: boolean;
  inputType: "word" | "phrase";
  standardForm: string;
  confidence: "high" | "medium" | "low";
  reason: string;
}

export interface EntriesGenerationResult {
  entries: Array<{
    ipa?: string;
    definition: string;
    partOfSpeech?: string;
    example: string;
  }>;
}
