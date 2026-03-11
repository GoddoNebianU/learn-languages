import { TSharedTranslationResult } from "@/shared/translator-type";

export type ServiceInputTranslateText = {
    sourceText: string;
    targetLanguage: string;
    forceRetranslate: boolean;
    needIpa: boolean;
    userId?: string;
    sourceLanguage?: string;
};

export type ServiceOutputTranslateText = TSharedTranslationResult;

// DTO types for deprecated genIPA function
export type ServiceInputGenIPA = {
    text: string;
};

export type ServiceOutputGenIPA = string;

// DTO types for deprecated genLanguage function
export type ServiceInputGenLanguage = {
    text: string;
};

export type ServiceOutputGenLanguage = string;
