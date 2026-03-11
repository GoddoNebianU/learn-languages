"use server";

import { headers } from "next/headers";
import { auth } from "@/auth";
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
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      log.warn("Unauthorized OCR attempt");
      return { success: false, message: "Unauthorized" };
    }

    const validatedInput = validate(input, schemaActionInputProcessOCR);
    return serviceProcessOCR({
      ...validatedInput,
      userId: session.user.id,
    });
  } catch (e) {
    if (e instanceof ValidateError) {
      return { success: false, message: e.message };
    }
    log.error("OCR action failed", { error: e });
    return { success: false, message: "Unknown error occurred." };
  }
}
