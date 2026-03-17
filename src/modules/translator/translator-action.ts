"use server";

import { serviceGenIPA, serviceGenLanguage, serviceTranslateText } from "./translator-service";
import {
    ActionInputTranslateText,
    ActionOutputTranslateText,
    validateActionInputTranslateText,
} from "./translator-action-dto";
import { createLogger } from "@/lib/logger";
import { ValidateError } from "@/lib/errors";

const log = createLogger("translator-action");

export const actionTranslateText = async (
    input: unknown,
): Promise<ActionOutputTranslateText> => {
    try {
        const validated = validateActionInputTranslateText(input);
        const result = await serviceTranslateText(validated);
        return {
            success: true,
            message: "Translation completed",
            data: result,
        };
    } catch (e) {
        if (e instanceof ValidateError) {
            return { success: false, message: e.message };
        }
        log.error("Translation failed", { error: e instanceof Error ? e.message : String(e) });
        return { success: false, message: "Translation failed" };
    }
};

export const genIPA = async (text: string): Promise<string> => {
    return serviceGenIPA({ text });
};

export const genLanguage = async (text: string): Promise<string> => {
    return serviceGenLanguage({ text });
};
