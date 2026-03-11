"use server";

import {
    ActionInputTranslateText,
    ActionOutputTranslateText,
    validateActionInputTranslateText,
} from "./translator-action-dto";
import { ValidateError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";
import { serviceTranslateText, serviceGenIPA, serviceGenLanguage } from "./translator-service";

const log = createLogger("translator-action");

export const actionTranslateText = async (
    dto: ActionInputTranslateText
): Promise<ActionOutputTranslateText> => {
    try {
        return {
            message: "success",
            success: true,
            data: await serviceTranslateText(validateActionInputTranslateText(dto)),
        };
    } catch (e) {
        if (e instanceof ValidateError) {
            return {
                success: false,
                message: e.message,
            };
        }
        log.error("Translation action failed", { error: e });
        return {
            success: false,
            message: "Unknown error occurred.",
        };
    }
};

/**
 * @deprecated 保留此函数以支持旧代码（text-speaker 功能）
 */
export const genIPA = async (text: string) => {
    return serviceGenIPA({ text });
};

/**
 * @deprecated 保留此函数以支持旧代码（text-speaker 功能）
 */
export const genLanguage = async (text: string) => {
    return serviceGenLanguage({ text });
};
