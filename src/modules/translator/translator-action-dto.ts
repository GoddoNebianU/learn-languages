import { TSharedTranslationResult } from "@/shared/translator-type";
import {
    LENGTH_MAX_LANGUAGE,
    LENGTH_MIN_LANGUAGE,
    LENGTH_MAX_TRANSLATOR_TEXT,
    LENGTH_MIN_TRANSLATOR_TEXT,
} from "@/shared/constant";
import { generateValidator } from "@/utils/validate";
import z from "zod";

const schemaActionInputTranslateText = z.object({
    sourceText: z.string().min(LENGTH_MIN_TRANSLATOR_TEXT).max(LENGTH_MAX_TRANSLATOR_TEXT),
    targetLanguage: z.string().min(LENGTH_MIN_LANGUAGE).max(LENGTH_MAX_LANGUAGE),
    forceRetranslate: z.boolean().optional().default(false),
    needIpa: z.boolean().optional().default(true),
    userId: z.string().optional(),
    sourceLanguage: z.string().min(LENGTH_MIN_LANGUAGE).max(LENGTH_MAX_LANGUAGE).optional(),
});

export type ActionInputTranslateText = z.infer<typeof schemaActionInputTranslateText>;

export const validateActionInputTranslateText = generateValidator(schemaActionInputTranslateText);

export type ActionOutputTranslateText = {
    message: string;
    success: boolean;
    data?: TSharedTranslationResult;
};
