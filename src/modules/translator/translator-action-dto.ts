
export interface CreateTranslationHistoryInput {
  userId?: string;
  sourceText: string;
  sourceLanguage: string;
  targetLanguage: string;
  translatedText: string;
  sourceIpa?: string;
  targetIpa?: string;
}

export interface TranslationHistoryQuery {
  sourceText: string;
  targetLanguage: string;
}

export interface TranslateTextInput {
  sourceText: string;
  targetLanguage: string;
  forceRetranslate?: boolean; // 默认 false
  needIpa?: boolean; // 默认 true
  userId?: string; // 可选用户 ID
}

export interface TranslateTextOutput {
  sourceText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  sourceIpa: string; // 如果 needIpa=false，返回空字符串
  targetIpa: string; // 如果 needIpa=false，返回空字符串
}

export interface TranslationLLMResponse {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  sourceIpa?: string; // 可选，根据 needIpa 决定
  targetIpa?: string; // 可选，根据 needIpa 决定
}
