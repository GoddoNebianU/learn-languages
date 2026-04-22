import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { username } from "better-auth/plugins";
import { createAuthMiddleware, APIError } from "better-auth/api";
import { prisma } from "./lib/db";
import { createLogger } from "./lib/logger";

const log = createLogger("auth");

import {
  sendEmail,
  generateVerificationEmailHtml,
  generateResetPasswordEmailHtml,
} from "./lib/email";

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
    sendOnSignIn: true,
    sendVerificationEmail: async ({ user, url }) => {
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
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
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
      }

      if (ctx.path === "/sign-in/username") {
        const body = ctx.body as { username?: string };
        if (body.username) {
          const user = await prisma.user.findFirst({
            where: {
              OR: [{ username: body.username }, { email: body.username }],
            },
            select: { emailVerified: true },
          });

          if (user && !user.emailVerified) {
            throw new APIError("FORBIDDEN", {
              message: "Please verify your email address before signing in",
            });
          }
        }
      }
    }),
  },
});
