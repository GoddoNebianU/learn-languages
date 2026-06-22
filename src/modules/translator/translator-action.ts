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
import { logActivity } from "@/modules/activity/activity-service";
import { ACTIVITY_ACTIONS } from "@/modules/activity/activity-constants";

const log = createLogger("translator-action");

export const actionTranslateText = async (input: unknown): Promise<ActionOutputTranslateText> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return { success: false, message: "Unauthorized" };

    const validated = validateActionInputTranslateText(input);
    const result = await serviceTranslateText(validated);
    await logActivity({
      userId,
      action: ACTIVITY_ACTIONS.TRANSLATOR.TRANSLATE,
      entityType: "translator",
      metadata: {
        sourceLanguage: validated.sourceLanguage,
        targetLanguage: validated.targetLanguage,
        textLength: validated.sourceText.length,
      },
    });
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
    const userId = await getCurrentUserId();
    const result = await serviceGenIPA({ text });
    if (userId) {
      await logActivity({
        userId,
        action: ACTIVITY_ACTIONS.TRANSLATOR.GEN_IPA,
        entityType: "translator",
        metadata: { textLength: text.length },
      });
    }
    return result;
  } catch (e) {
    log.error("genIPA failed", { error: String(e) });
    return "";
  }
};

export const genLanguage = async (text: string): Promise<string> => {
  try {
    const userId = await getCurrentUserId();
    const result = await serviceGenLanguage({ text });
    if (userId) {
      await logActivity({
        userId,
        action: ACTIVITY_ACTIONS.TRANSLATOR.GEN_LANGUAGE,
        entityType: "translator",
        metadata: { textLength: text.length },
      });
    }
    return result;
  } catch (e) {
    log.error("genLanguage failed", { error: String(e) });
    return "";
  }
};
