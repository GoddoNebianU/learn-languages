"use server";

import { validate } from "@/utils/validate";
import { ValidateError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";
import { serviceProcessOCR } from "./ocr-service";
import { schemaActionInputProcessOCR } from "./ocr-action-dto";
import type { ActionOutputProcessOCR } from "./ocr-action-dto";

const log = createLogger("ocr-action");

export async function actionProcessOCR(
  input: unknown
): Promise<ActionOutputProcessOCR> {
  try {
    const validatedInput = validate(input, schemaActionInputProcessOCR);
    return serviceProcessOCR(validatedInput);
  } catch (e) {
    if (e instanceof ValidateError) {
      return { success: false, message: e.message };
    }
    log.error("OCR action failed", { error: e });
    return { success: false, message: "Unknown error occurred." };
  }
}
