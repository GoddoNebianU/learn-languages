"use server";

import { serviceGenIPA, serviceGenLanguage, serviceTranslateText } from "./translator-service";
import {
  ActionInputTranslateText,
  ActionOutputTranslateText,
  validateActionInputTranslateText,
} from "./translator-action-dto";
import { getCurrentUserId } from "@/modules/shared/action-utils";
import { createLogger } from "@/lib/logger";
import { ValidateError } from "@/lib/errors";

const log = createLogger("translator-action");

export const actionTranslateText = async (input: unknown): Promise<ActionOutputTranslateText> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return { success: false, message: "Unauthorized" };

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
    const errorMessage = e instanceof Error ? e.message : String(e);
    log.error("Translation failed", { error: errorMessage });
    return { success: false, message: `Translation failed: ${errorMessage}` };
  }
};

export const genIPA = async (text: string): Promise<string> => {
  try {
    return await serviceGenIPA({ text });
  } catch (e) {
    log.error("genIPA failed", { error: String(e) });
    return "";
  }
};

export const genLanguage = async (text: string): Promise<string> => {
  try {
    return await serviceGenLanguage({ text });
  } catch (e) {
    log.error("genLanguage failed", { error: String(e) });
    return "";
  }
};
