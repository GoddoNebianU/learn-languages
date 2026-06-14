import { prisma } from "@/lib/db";
import { Prisma } from "../../../generated/prisma/client";
import { createLogger } from "@/lib/logger";

const log = createLogger("admin-repository");

// --- Types ---

export interface RepoOutputSystemConfig {
  id: number;
  tier: string;
  services: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
}

export interface RepoOutputTierCapability {
  tier: string;
  signup: boolean;
  userProfile: boolean;
  social: boolean;
  email: boolean;
}

export interface RepoInputUpdateSystemConfig {
  tier: string;
  services: Record<string, unknown>;
}

export interface RepoInputUpsertTierCapability {
  tier: string;
  signup: boolean;
  userProfile: boolean;
  social: boolean;
  email: boolean;
}

// --- SystemConfig ---

export async function repoGetSystemConfig(): Promise<RepoOutputSystemConfig | null> {
  const config = await prisma.systemConfig.findUnique({ where: { id: 1 } });
  return config;
}

export async function repoUpdateSystemConfig(input: RepoInputUpdateSystemConfig): Promise<void> {
  await prisma.systemConfig.upsert({
    where: { id: 1 },
    update: { tier: input.tier, services: input.services as Prisma.InputJsonValue },
    create: { id: 1, tier: input.tier, services: input.services as Prisma.InputJsonValue },
  });
  log.info("SystemConfig updated", { tier: input.tier });
}

// --- TierCapability ---

export async function repoGetTierCapability(tier: string): Promise<RepoOutputTierCapability | null> {
  const row = await prisma.tierCapability.findUnique({ where: { tier } });
  return row;
}

export async function repoGetAllTierCapabilities(): Promise<RepoOutputTierCapability[]> {
  const rows = await prisma.tierCapability.findMany({ orderBy: { tier: "asc" } });
  return rows;
}

export async function repoUpsertTierCapability(input: RepoInputUpsertTierCapability): Promise<void> {
  await prisma.tierCapability.upsert({
    where: { tier: input.tier },
    update: {
      signup: input.signup,
      userProfile: input.userProfile,
      social: input.social,
      email: input.email,
    },
    create: {
      tier: input.tier,
      signup: input.signup,
      userProfile: input.userProfile,
      social: input.social,
      email: input.email,
    },
  });
  log.info("TierCapability upserted", { tier: input.tier });
}

export async function repoCreateTierCapability(input: RepoInputUpsertTierCapability): Promise<void> {
  await prisma.tierCapability.create({
    data: {
      tier: input.tier,
      signup: input.signup,
      userProfile: input.userProfile,
      social: input.social,
      email: input.email,
    },
  });
  log.info("TierCapability created", { tier: input.tier });
}

export async function repoDeleteTierCapability(tier: string): Promise<number> {
  const result = await prisma.tierCapability.deleteMany({ where: { tier } });
  log.info("TierCapability deleted", { tier, count: result.count });
  return result.count;
}

export interface RepoInputUpdateSettingsAtomic {
  tier: string;
  services: Record<string, unknown>;
  capabilities?: {
    signup: boolean;
    userProfile: boolean;
    social: boolean;
    email: boolean;
  };
}

export async function repoUpdateSettingsAtomic(input: RepoInputUpdateSettingsAtomic): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.systemConfig.upsert({
      where: { id: 1 },
      update: { tier: input.tier, services: input.services as Prisma.InputJsonValue },
      create: { id: 1, tier: input.tier, services: input.services as Prisma.InputJsonValue },
    });
    if (input.capabilities) {
      await tx.tierCapability.upsert({
        where: { tier: input.tier },
        update: {
          signup: input.capabilities.signup,
          userProfile: input.capabilities.userProfile,
          social: input.capabilities.social,
          email: input.capabilities.email,
        },
        create: {
          tier: input.tier,
          signup: input.capabilities.signup,
          userProfile: input.capabilities.userProfile,
          social: input.capabilities.social,
          email: input.capabilities.email,
        },
      });
    }
  });
  log.info("Settings updated atomically", { tier: input.tier });
}
