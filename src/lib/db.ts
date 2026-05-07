import { PrismaClient } from "../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { serverEnv } from "./env";

const adapter = new PrismaPg({ connectionString: serverEnv.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

export { prisma }

process.on("beforeExit", async () => {
  await prisma.$disconnect();
});
