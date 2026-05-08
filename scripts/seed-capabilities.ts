/**
 * Seed script for SystemConfig and TierCapability tables.
 *
 * Usage:
 *   DATABASE_URL=xxx npx tsx scripts/seed-capabilities.ts
 *   DATABASE_URL=xxx npx tsx scripts/seed-capabilities.ts --tier=SINGLE
 *   DATABASE_URL=xxx npx tsx scripts/seed-capabilities.ts --tier=MULTI
 */

import { PrismaClient } from "../generated/prisma/client";
import type { InputJsonValue } from "@prisma/client/runtime/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { DeploymentTier } from "../generated/prisma/enums";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const TIER_DEFAULTS: Record<DeploymentTier, { signup: boolean; userProfile: boolean; social: boolean; email: boolean }> = {
  SINGLE: { signup: false, userProfile: false, social: false, email: false },
  MULTI: { signup: true, userProfile: true, social: true, email: true },
};

const DEFAULT_SERVICES: Record<DeploymentTier, InputJsonValue> = {
  SINGLE: {
    llm: { apiKey: "", apiUrl: "https://api.deepseek.com/chat/completions", modelName: "deepseek-v3" },
    tts: { apiKey: "" },
    smtp: { host: "localhost", port: 587, secure: false, user: "unused", pass: "unused", from: "" },
  },
  MULTI: {
    llm: { apiKey: "", apiUrl: "https://api.deepseek.com/chat/completions", modelName: "deepseek-v3" },
    tts: { apiKey: "" },
    smtp: { host: "", port: 587, secure: false, user: "", pass: "", from: "" },
  },
};

async function main() {
  const tierArg = process.argv.find((a) => a.startsWith("--tier="));
  const tierInput = tierArg ? tierArg.split("=")[1] : undefined;

  if (tierInput && tierInput !== "SINGLE" && tierInput !== "MULTI") {
    console.error("Invalid tier. Use SINGLE or MULTI.");
    process.exit(1);
  }

  const configTier: DeploymentTier = tierInput === "MULTI" ? "MULTI" : "SINGLE";

  for (const tierName of Object.values(DeploymentTier)) {
    const caps = TIER_DEFAULTS[tierName];
    await prisma.tierCapability.upsert({
      where: { tier: tierName },
      update: caps,
      create: { tier: tierName, ...caps },
    });
    console.log(`Seeded capabilities for tier: ${tierName}`);
  }

  const services = DEFAULT_SERVICES[configTier];

  await prisma.systemConfig.upsert({
    where: { id: 1 },
    update: { tier: configTier, services },
    create: { id: 1, tier: configTier, services },
  });
  console.log(`SystemConfig set to tier: ${configTier}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
