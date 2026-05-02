import { auth } from "@/auth";
import { createLogger } from "@/lib/logger";
import { repoFindUserByEmail } from "./forgot-password-repository";
import {
  ServiceInputRequestPasswordReset,
  ServiceOutputRequestPasswordReset,
} from "./forgot-password-service-dto";

const log = createLogger("forgot-password-service");

export async function serviceRequestPasswordReset(
  dto: ServiceInputRequestPasswordReset
): Promise<ServiceOutputRequestPasswordReset> {
  log.info("Processing password reset request", { email: dto.email });

  const user = await repoFindUserByEmail({ email: dto.email });

  if (user) {
    await auth.api.requestPasswordReset({
      body: {
        email: dto.email,
        redirectTo: "/reset-password",
      },
    });
  }

  return {
    success: true,
    message: "如果该邮箱已注册，重置密码邮件已发送，请检查您的邮箱",
  };
}
