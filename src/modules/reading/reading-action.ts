"use server";

import { serviceReadText } from "./reading-service";
import {
  ActionOutputReadText,
  validateActionInputReadText,
} from "./reading-action-dto";
import { createLogger } from "@/lib/logger";
import { ValidateError } from "@/lib/errors";

const log = createLogger("reading-action");

export const actionReadText = async (input: unknown): Promise<ActionOutputReadText> => {
  try {
    const validated = validateActionInputReadText(input);
    const result = await serviceReadText(validated);
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
