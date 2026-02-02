export type RepoInputSelectLatestTranslation = {
    sourceText: string;
    targetLanguage: string;
};

export type RepoOutputSelectLatestTranslation = {
    id: number;
    translatedText: string;
    sourceLanguage: string;
    targetLanguage: string;
    sourceIpa: string | null;
    targetIpa: string | null;
} | null;

export type RepoInputCreateTranslationHistory = {
    userId?: string;
    sourceText: string;
    sourceLanguage: string;
    targetLanguage: string;
    translatedText: string;
    sourceIpa?: string;
    targetIpa?: string;
};
