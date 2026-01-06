/**
 * Service 层的自定义业务类型
 *
 * 这些类型用于替换 Prisma 生成的类型，提高代码的可维护性和抽象层次
 */

// Folder 相关
export interface CreateFolderInput {
  name: string;
  userId: string;
}

export interface UpdateFolderInput {
  name?: string;
}

// Pair 相关
export interface CreatePairInput {
  text1: string;
  text2: string;
  language1: string;
  language2: string;
  ipa1?: string;
  ipa2?: string;
  folderId: number;
}

export interface UpdatePairInput {
  text1?: string;
  text2?: string;
  language1?: string;
  language2?: string;
  ipa1?: string;
  ipa2?: string;
}

// Translation 相关
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

// Dictionary 相关
export interface CreateDictionaryLookUpInput {
  userId?: string;
  text: string;
  queryLang: string;
  definitionLang: string;
  dictionaryWordId?: number;
  dictionaryPhraseId?: number;
}

export interface DictionaryLookUpQuery {
  userId?: string;
  text?: string;
  queryLang?: string;
  definitionLang?: string;
  dictionaryWordId?: number;
  dictionaryPhraseId?: number;
}

export interface CreateDictionaryWordInput {
  standardForm: string;
  queryLang: string;
  definitionLang: string;
}

export interface CreateDictionaryPhraseInput {
  standardForm: string;
  queryLang: string;
  definitionLang: string;
}

export interface CreateDictionaryWordEntryInput {
  wordId: number;
  ipa: string;
  definition: string;
  partOfSpeech: string;
  example: string;
}

export interface CreateDictionaryPhraseEntryInput {
  phraseId: number;
  definition: string;
  example: string;
}

// 翻译相关 - 统一翻译函数
export interface TranslateTextInput {
  sourceText: string;
  targetLanguage: string;
  forceRetranslate?: boolean;  // 默认 false
  needIpa?: boolean;           // 默认 true
  userId?: string;             // 可选用户 ID
}

export interface TranslateTextOutput {
  sourceText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  sourceIpa: string;   // 如果 needIpa=false，返回空字符串
  targetIpa: string;   // 如果 needIpa=false，返回空字符串
}

export interface TranslationLLMResponse {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  sourceIpa?: string;   // 可选，根据 needIpa 决定
  targetIpa?: string;   // 可选，根据 needIpa 决定
}
