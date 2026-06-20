"use server";

import { timingSafeEqual } from "crypto";
import { headers } from "next/headers";
import z from "zod";
import { createLogger } from "@/lib/logger";
import {
  createAdminSession,
  verifyAdminSession,
  clearAdminSession,
  getAdminPassword,
} from "@/lib/admin-auth";
import {
  serviceGetAdminSettings,
  serviceUpdateAdminSettings,
  serviceCreateUser,
  serviceDeleteUser,
  serviceSetUserEmailVerified,
  serviceUpdateUser,
} from "@/modules/admin/admin-service";
import { logActivity } from "@/modules/activity/activity-service";
import { ACTIVITY_ACTIONS } from "@/modules/activity/activity-constants";

const log = createLogger("admin-action");

// --- H1: constant-time password comparison ---
function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

// --- H2: in-memory login rate limiter (per IP, max 5 attempts / 15 min) ---
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(key);
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_ATTEMPTS) return false;
  entry.count++;
  return true;
}

function recordFailedAttempt(key: string): void {
  const now = Date.now();
  const entry = loginAttempts.get(key);
  if (entry && now <= entry.resetAt) {
    entry.count++;
  } else {
    loginAttempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
  }
}

export async function actionAdminLogin(formData: FormData) {
  const password = formData.get("password");
  if (typeof password !== "string") {
    return { success: false as const, message: "Invalid input" };
  }

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (!checkRateLimit(ip)) {
    return {
      success: false as const,
      message: "Too many login attempts. Please try again later.",
    };
  }

  try {
    const adminPassword = getAdminPassword();

    if (safeCompare(password, adminPassword)) {
      loginAttempts.delete(ip);
      await createAdminSession();
      log.info("Admin authenticated");
      return { success: true as const, message: "Logged in" };
    }

    recordFailedAttempt(ip);
    return { success: false as const, message: "Invalid password" };
  } catch (error) {
    log.error("Admin login failed", { error: String(error) });
    return { success: false as const, message: "Login failed" };
  }
}

export async function actionAdminLogout() {
  await clearAdminSession();
  return { success: true as const, message: "Logged out" };
}

export async function actionCheckAdminAuth() {
  const isAuth = await verifyAdminSession();
  if (isAuth) {
    return { success: true as const, message: "Authenticated" };
  }
  return { success: false as const, message: "Not authenticated" };
}

export async function actionGetAdminSettings() {
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    return { success: false as const, message: "Unauthorized" };
  }

  const result = await serviceGetAdminSettings();
  if (result.success) {
    return { success: true as const, message: result.message, data: result.data };
  }
  return { success: false as const, message: result.message };
}

const settingsSchema = z.object({
  capabilities: z
    .object({
      signup: z.boolean(),
      userProfile: z.boolean(),
      social: z.boolean(),
      email: z.boolean(),
    })
    .optional(),
  services: z
    .object({
      llm: z.object({ apiKey: z.string(), apiUrl: z.string(), modelName: z.string() }).optional(),
      tts: z
        .object({
          apiKey: z.string(),
          primaryUrl: z.string(),
          primaryUsername: z.string(),
          primaryPassword: z.string(),
        })
        .optional(),
      smtp: z
        .object({
          host: z.string(),
          port: z.number(),
          secure: z.boolean(),
          user: z.string(),
          pass: z.string(),
          from: z.string(),
        })
        .optional(),
    })
    .optional(),
});

export async function actionUpdateAdminSettings(input: unknown) {
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    return { success: false as const, message: "Unauthorized" };
  }

  const result = settingsSchema.safeParse(input);
  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    return { success: false as const, message: `Validation failed: ${errors}` };
  }

  const updateResult = await serviceUpdateAdminSettings(result.data);
  if (updateResult.success) {
    await logActivity({
      userId: null,
      action: ACTIVITY_ACTIONS.ADMIN.CONFIG_UPDATE,
      entityType: "system_config",
    });
  }
  return updateResult;
}

const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, "letters, numbers, underscores only"),
  password: z.string().min(8),
  emailVerified: z.boolean().optional(),
});

export async function actionCreateUser(input: unknown) {
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    return { success: false as const, message: "Unauthorized" };
  }

  const result = createUserSchema.safeParse(input);
  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    return { success: false as const, message: `Validation failed: ${errors}` };
  }

  const createResult = await serviceCreateUser(result.data);
  if (createResult.success && createResult.data) {
    await logActivity({
      userId: null,
      action: ACTIVITY_ACTIONS.ADMIN.USER_CREATE,
      entityType: "user",
      entityId: createResult.data.id,
    });
  }
  return createResult;
}

export async function actionDeleteUser(userId: string) {
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    return { success: false as const, message: "Unauthorized" };
  }

  if (!userId || typeof userId !== "string") {
    return { success: false as const, message: "Invalid user id" };
  }

  const deleteResult = await serviceDeleteUser(userId);
  if (deleteResult.success) {
    await logActivity({
      userId: null,
      action: ACTIVITY_ACTIONS.ADMIN.USER_DELETE,
      entityType: "user",
      entityId: userId,
    });
  }
  return deleteResult;
}

export async function actionSetUserEmailVerified(userId: string, verified: boolean) {
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    return { success: false as const, message: "Unauthorized" };
  }

  if (!userId || typeof userId !== "string") {
    return { success: false as const, message: "Invalid user id" };
  }
  if (typeof verified !== "boolean") {
    return { success: false as const, message: "Invalid verified flag" };
  }

  const verifyResult = await serviceSetUserEmailVerified(userId, verified);
  if (verifyResult.success) {
    await logActivity({
      userId: null,
      action: ACTIVITY_ACTIONS.ADMIN.USER_UPDATE,
      entityType: "user",
      entityId: userId,
      metadata: { field: "emailVerified", value: verified },
    });
  }
  return verifyResult;
}

const updateUserSchema = z.object({
  userId: z.string().min(1),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, "letters, numbers, underscores only"),
  password: z.string().optional(),
});

export async function actionUpdateUser(input: unknown) {
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    return { success: false as const, message: "Unauthorized" };
  }

  const result = updateUserSchema.safeParse(input);
  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    return { success: false as const, message: `Validation failed: ${errors}` };
  }

  const updateResult = await serviceUpdateUser(result.data);
  if (updateResult.success) {
    await logActivity({
      userId: null,
      action: ACTIVITY_ACTIONS.ADMIN.USER_UPDATE,
      entityType: "user",
      entityId: result.data.userId,
    });
  }
  return updateResult;
}
