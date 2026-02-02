import { TSharedItem } from "@/shared/dictionary-type";
import { LENGTH_MAX_DICTIONARY_TEXT, LENGTH_MAX_LANGUAGE, LENGTH_MIN_DICTIONARY_TEXT, LENGTH_MIN_LANGUAGE } from "@/shared/constant";
import { generateValidator } from "@/utils/validate";
import z from "zod";

const schemaActionInputLookUpDictionary = z.object({
    text: z.string().min(LENGTH_MIN_DICTIONARY_TEXT).max(LENGTH_MAX_DICTIONARY_TEXT),
    queryLang: z.string().min(LENGTH_MIN_LANGUAGE).max(LENGTH_MAX_LANGUAGE),
    forceRelook: z.boolean(),
    definitionLang: z.string().min(LENGTH_MIN_LANGUAGE).max(LENGTH_MAX_LANGUAGE),
    userId: z.string().optional()
});

export type ActionInputLookUpDictionary = z.infer<typeof schemaActionInputLookUpDictionary>;

export const validateActionInputLookUpDictionary = generateValidator(schemaActionInputLookUpDictionary);

export type ActionOutputLookUpDictionary = {
    message: string,
    success: boolean;
    data?: TSharedItem;
};
