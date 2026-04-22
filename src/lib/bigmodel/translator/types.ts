export interface LanguageDetectionResult {
  sourceLanguage: string;
  confidence: "high" | "medium" | "low";
}

export interface TranslationLLMResponse {
  sourceText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  sourceIpa?: string;
  targetIpa?: string;
}
