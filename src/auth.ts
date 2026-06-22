import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { username } from "better-auth/plugins";
import { createAuthMiddleware, APIError } from "better-auth/api";
import { prisma } from "./lib/db";
import { createLogger } from "./lib/logger";

const log = createLogger("auth");

import { sendEmail } from "./lib/providers/smtp";
import { generateVerificationEmailHtml, generateResetPasswordEmailHtml } from "./lib/email";
import { logActivity } from "./modules/activity/activity-service";
import { ACTIVITY_ACTIONS } from "./modules/activity/activity-constants";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      const result = await sendEmail({
        to: user.email,
        subject: "重置您的密码 - Learn Languages",
        html: generateResetPasswordEmailHtml(url, user.name || "用户"),
      });
      if (!result.success) {
        log.error("Failed to send reset password email", { error: result.error });
      }
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await logActivity({
        userId: user.id,
        action: ACTIVITY_ACTIONS.AUTH.EMAIL_VERIFY_SEND,
        entityType: "user",
        entityId: user.id,
      });
      const result = await sendEmail({
        to: user.email,
        subject: "验证您的邮箱 - Learn Languages",
        html: generateVerificationEmailHtml(url, user.name || "用户"),
      });
      if (!result.success) {
        log.error("Failed to send verification email", { error: result.error });
      }
    },
  },
  plugins: [nextCookies(), username()],
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-up/email" || ctx.path === "/update-user") {
        const body = ctx.body as { username?: string };
        if (!body.username || body.username.trim() === "") {
          throw new APIError("BAD_REQUEST", {
            message: "Username is required",
          });
        }
        if (!/^[a-zA-Z0-9_]+$/.test(body.username)) {
          throw new APIError("BAD_REQUEST", {
            message: "Username can only contain letters, numbers, and underscores",
          });
        }
      }

      if (ctx.path === "/sign-in/username") {
        const body = ctx.body as { username?: string };
        if (body.username) {
          const user = await prisma.user.findFirst({
            where: {
              OR: [{ username: body.username }, { email: body.username }],
            },
            select: { emailVerified: true, email: true },
          });

          if (user && !user.emailVerified) {
            await logActivity({
              userId: null,
              action: ACTIVITY_ACTIONS.AUTH.LOGIN_FAILED,
              entityType: "user",
              metadata: { email: user.email, reason: "email_not_verified" },
            });
            throw new APIError("FORBIDDEN", {
              message: "Please verify your email address before signing in",
            });
          }
        }
      }
    }),
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await logActivity({
            userId: user.id,
            action: ACTIVITY_ACTIONS.AUTH.SIGNUP,
            entityType: "user",
            entityId: user.id,
            metadata: { email: user.email },
          });
        },
      },
    },
    session: {
      create: {
        after: async (session) => {
          await logActivity({
            userId: session.userId,
            action: ACTIVITY_ACTIONS.AUTH.LOGIN,
            entityType: "session",
            entityId: session.id,
            ip: session.ipAddress ?? null,
            userAgent: session.userAgent ?? null,
          });
        },
      },
    },
  },
});
