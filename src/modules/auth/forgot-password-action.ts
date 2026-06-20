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
import { logActivity } from "@/modules/activity/activity-service";
import { ACTIVITY_ACTIONS } from "@/modules/activity/activity-constants";

const log = createLogger("forgot-password-action");

export async function actionRequestPasswordReset(
  input: unknown
): Promise<ActionOutputForgotPassword> {
  try {
    const dto = validate(input, schemaActionInputForgotPassword) as ActionInputForgotPassword;

    const result = await serviceRequestPasswordReset({ email: dto.email });
    if (result.success) {
      await logActivity({
        userId: null,
        action: ACTIVITY_ACTIONS.AUTH.PASSWORD_RESET_REQUEST,
        entityType: "user",
        metadata: { email: dto.email },
      });
    }
    return result;
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
