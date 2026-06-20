"use server";

import { serviceReadText } from "./reading-service";
import {
  ActionOutputReadText,
  validateActionInputReadText,
} from "./reading-action-dto";
import { getCurrentUserId } from "@/modules/shared/action-utils";
import { createLogger } from "@/lib/logger";
import { ValidateError } from "@/lib/errors";
import { logActivity } from "@/modules/activity/activity-service";
import { ACTIVITY_ACTIONS } from "@/modules/activity/activity-constants";

const log = createLogger("reading-action");

export const actionReadText = async (input: unknown): Promise<ActionOutputReadText> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return { success: false, message: "Unauthorized" };

    const validated = validateActionInputReadText(input);
    const result = await serviceReadText(validated);
    await logActivity({
      userId,
      action: ACTIVITY_ACTIONS.READING.READ,
      entityType: "reading",
      metadata: {
        sourceLanguage: validated.sourceLanguage,
        targetLanguage: validated.targetLanguage,
        textLength: validated.text.length,
      },
    });
    return {
      success: true,
      message: "Reading translation completed",
      data: result,
    };
  } catch (e) {
    if (e instanceof ValidateError) {
      return { success: false, message: e.message };
    }
    const errorMessage = e instanceof Error ? e.message : String(e);
    log.error("Reading translation failed", { error: errorMessage });
    return { success: false, message: `Reading translation failed: ${errorMessage}` };
  }
};
