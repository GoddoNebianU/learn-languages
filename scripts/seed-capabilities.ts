/**
 * Seed script for SystemConfig table.
 *
 * Usage:
 *   DATABASE_URL=xxx npx tsx scripts/seed-capabilities.ts
 */

import { PrismaClient } from "../generated/prisma/client";
import type { InputJsonValue } from "@prisma/client/runtime/client";
import { PrismaPg } from "@prisma/adapter-pg";
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const DEFAULT_CAPABILITIES = {
  signup: true,
  userProfile: true,
  social: true,
  email: true,
};

const DEFAULT_SERVICES: InputJsonValue = {
  llm: { apiKey: "", apiUrl: "https://api.deepseek.com/chat/completions", modelName: "deepseek-v4-flash" },
  tts: { apiKey: "", primaryUrl: "", primaryUsername: "", primaryPassword: "" },
  smtp: { host: "", port: 587, secure: false, user: "", pass: "", from: "" },
};

async function main() {
  await prisma.systemConfig.upsert({
    where: { id: 1 },
    update: { ...DEFAULT_CAPABILITIES, services: DEFAULT_SERVICES },
    create: { id: 1, ...DEFAULT_CAPABILITIES, services: DEFAULT_SERVICES },
  });
  console.log("SystemConfig seeded with default capabilities (all enabled) and services");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
