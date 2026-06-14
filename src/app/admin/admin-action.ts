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
  serviceAddTier,
  serviceDeleteTier,
} from "@/modules/admin/admin-service";

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
  tier: z.string().min(1).optional(),
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
      tts: z.object({ apiKey: z.string() }).optional(),
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

  return serviceUpdateAdminSettings(result.data);
}

const addTierSchema = z.object({
  name: z.string().min(1).max(50),
});

export async function actionAddTier(input: unknown) {
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    return { success: false as const, message: "Unauthorized" };
  }

  const result = addTierSchema.safeParse(input);
  if (!result.success) {
    return { success: false as const, message: "Invalid tier name" };
  }

  return serviceAddTier(result.data);
}

export async function actionDeleteTier(tier: string) {
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    return { success: false as const, message: "Unauthorized" };
  }

  if (!tier || typeof tier !== "string") {
    return { success: false as const, message: "Invalid tier name" };
  }

  return serviceDeleteTier({ tier });
}
