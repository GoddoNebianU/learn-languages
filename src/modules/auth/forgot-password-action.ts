"use server";

import { createLogger } from "@/lib/logger";
import { validate } from "@/utils/validate";
import { ValidateError } from "@/lib/errors";
import {
  schemaActionInputForgotPassword,
  type ActionInputForgotPassword,
  type ActionOutputForgotPassword,
} from "./forgot-password-action-dto";
import { serviceRequestPasswordReset } from "./forgot-password-service";

const log = createLogger("forgot-password-action");

export async function actionRequestPasswordReset(
  input: unknown
): Promise<ActionOutputForgotPassword> {
  try {
    const dto = validate(input, schemaActionInputForgotPassword) as ActionInputForgotPassword;

    return await serviceRequestPasswordReset({ email: dto.email });
  } catch (e) {
    if (e instanceof ValidateError) {
      return {
        success: false,
        message: e.message,
      };
    }
    log.error("Password reset request failed", { error: e });
    return {
      success: false,
      message: "发送重置邮件失败，请稍后重试",
    };
  }
}
