"use server";

import z from "zod";
import { prisma } from "@/lib/db";
import { Prisma } from "../../../generated/prisma/client";
import { createLogger } from "@/lib/logger";
import { invalidateCapabilityCache } from "@/lib/capability";
import type { DeploymentTier } from "@/lib/capability";
import {
  createAdminSession,
  verifyAdminSession,
  clearAdminSession,
  getAdminPassword,
} from "@/lib/admin-auth";

const log = createLogger("admin-action");

export async function actionAdminLogin(formData: FormData) {
  const password = formData.get("password");
  if (typeof password !== "string") {
    return { success: false as const, message: "Invalid input" };
  }

  try {
    const adminPassword = getAdminPassword();

    if (password === adminPassword) {
      await createAdminSession();
      log.info("Admin authenticated");
      return { success: true as const, message: "Logged in" };
    }

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

export async function actionGetAdminSettings() {
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    return { success: false as const, message: "Unauthorized" };
  }

  try {
    const config = await prisma.systemConfig.findUnique({ where: { id: 1 } });
    if (!config) {
      return { success: false as const, message: "System config not found" };
    }

    const tier = config.tier;
    const tierRow = await prisma.tierCapability.findUnique({ where: { tier } });
    const allTiers = await prisma.tierCapability.findMany({ orderBy: { tier: "asc" } });
    const services = (config.services ?? {}) as Record<string, unknown>;

    const llm = (services.llm ?? {}) as Record<string, string>;
    const tts = (services.tts ?? {}) as Record<string, string>;
    const smtp = (services.smtp ?? {}) as Record<string, unknown>;

    return {
      success: true as const,
      message: "Settings loaded",
      data: {
        tier,
        allTiers: allTiers.map((t) => ({
          tier: t.tier,
          capabilities: {
            signup: t.signup,
            userProfile: t.userProfile,
            social: t.social,
            email: t.email,
          },
        })),
        capabilities: {
          signup: tierRow?.signup ?? true,
          userProfile: tierRow?.userProfile ?? true,
          social: tierRow?.social ?? true,
          email: tierRow?.email ?? true,
        },
        services: {
          llm: {
            apiKey: llm.apiKey ?? "",
            apiUrl: llm.apiUrl ?? "",
            modelName: llm.modelName ?? "",
          },
          tts: { apiKey: tts.apiKey ?? "" },
          smtp: {
            host: (smtp.host as string) ?? "",
            port: (smtp.port as number) ?? 587,
            secure: (smtp.secure as boolean) ?? false,
            user: (smtp.user as string) ?? "",
            pass: (smtp.pass as string) ?? "",
            from: (smtp.from as string) ?? "",
          },
        },
      },
    };
  } catch (error) {
    log.error("Failed to load admin settings", { error: String(error) });
    return { success: false as const, message: "Failed to load settings" };
  }
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

  const data = result.data;

  try {
    const config = await prisma.systemConfig.findUnique({ where: { id: 1 } });
    const currentServices = (config?.services ?? {}) as Record<string, unknown>;
    const currentTier = config?.tier ?? ("SINGLE" as DeploymentTier);

    const newTier = data.tier ?? currentTier;

    const mergedServices: Record<string, unknown> = { ...currentServices };
    if (data.services?.llm) {
      mergedServices.llm = data.services.llm;
    }
    if (data.services?.tts) {
      mergedServices.tts = data.services.tts;
    }
    if (data.services?.smtp) {
      mergedServices.smtp = data.services.smtp;
    }

    await prisma.systemConfig.upsert({
      where: { id: 1 },
      update: { tier: newTier, services: mergedServices as Prisma.InputJsonValue },
      create: { id: 1, tier: newTier, services: mergedServices as Prisma.InputJsonValue },
    });

    if (data.capabilities) {
      await prisma.tierCapability.upsert({
        where: { tier: newTier },
        update: {
          signup: data.capabilities.signup,
          userProfile: data.capabilities.userProfile,
          social: data.capabilities.social,
          email: data.capabilities.email,
        },
        create: {
          tier: newTier,
          signup: data.capabilities.signup,
          userProfile: data.capabilities.userProfile,
          social: data.capabilities.social,
          email: data.capabilities.email,
        },
      });
    }

    invalidateCapabilityCache();
    log.info("Admin settings updated");

    return { success: true as const, message: "Settings saved" };
  } catch (error) {
    log.error("Failed to update admin settings", { error: String(error) });
    return { success: false as const, message: "Failed to save settings" };
  }
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

  const { name } = result.data;

  try {
    const existing = await prisma.tierCapability.findUnique({ where: { tier: name } });
    if (existing) {
      return { success: false as const, message: "Tier already exists" };
    }

    await prisma.tierCapability.create({
      data: { tier: name, signup: true, userProfile: true, social: true, email: true },
    });

    log.info("Tier added", { tier: name });
    return { success: true as const, message: `Tier "${name}" added` };
  } catch (error) {
    log.error("Failed to add tier", { error: String(error) });
    return { success: false as const, message: "Failed to add tier" };
  }
}

export async function actionDeleteTier(tier: string) {
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    return { success: false as const, message: "Unauthorized" };
  }

  if (!tier || typeof tier !== "string") {
    return { success: false as const, message: "Invalid tier name" };
  }

  try {
    const config = await prisma.systemConfig.findUnique({ where: { id: 1 } });
    if (config?.tier === tier) {
      return { success: false as const, message: "Cannot delete the active tier" };
    }

    const deleted = await prisma.tierCapability.deleteMany({ where: { tier } });
    if (deleted.count === 0) {
      return { success: false as const, message: "Tier not found" };
    }

    log.info("Tier deleted", { tier });
    return { success: true as const, message: `Tier "${tier}" deleted` };
  } catch (error) {
    log.error("Failed to delete tier", { error: String(error) });
    return { success: false as const, message: "Failed to delete tier" };
  }
}

export async function actionCheckAdminAuth() {
  const isAuth = await verifyAdminSession();
  if (isAuth) {
    return { success: true as const, message: "Authenticated" };
  }
  return { success: false as const, message: "Not authenticated" };
}
