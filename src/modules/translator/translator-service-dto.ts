import { TSharedTranslationResult } from "@/shared";

export type ServiceInputTranslateText = {
    sourceText: string;
    targetLanguage: string;
    forceRetranslate: boolean;
    needIpa: boolean;
    userId?: string;
};

export type ServiceOutputTranslateText = TSharedTranslationResult;
