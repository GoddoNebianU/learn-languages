import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { Prisma } from "../../generated/prisma/client";
import { createLogger } from "@/lib/logger";

const log = createLogger("admin-auth");

const COOKIE_NAME = "admin_session";
const ALGORITHM = "HS256";
const EXPIRES_IN = "24h";

function getSecret(): Uint8Array {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) {
    throw new Error("BETTER_AUTH_SECRET is not configured");
  }
  return new TextEncoder().encode(secret);
}

export async function getAdminPassword(): Promise<string> {
  const config = await prisma.systemConfig.findUnique({ where: { id: 1 } });
  const services = (config?.services ?? {}) as Record<string, unknown>;
  const admin = (services.admin ?? {}) as Record<string, string>;
  return admin.password ?? "";
}

export async function setAdminPassword(password: string): Promise<void> {
  const config = await prisma.systemConfig.findUnique({ where: { id: 1 } });
  const services = (config?.services ?? {}) as Record<string, unknown>;
  const admin = (services.admin ?? {}) as Record<string, string>;

  const servicesUpdate = {
    ...services,
    admin: { ...admin, password },
  } as Prisma.InputJsonValue;

  await prisma.systemConfig.upsert({
    where: { id: 1 },
    update: { services: servicesUpdate },
    create: {
      id: 1,
      services: { admin: { password } } as Prisma.InputJsonValue,
    },
  });

  log.info("Admin password updated");
}

export async function createAdminSession(): Promise<void> {
  const secret = getSecret();
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(EXPIRES_IN)
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  log.info("Admin session created");
}

export async function verifyAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return false;

    const secret = getSecret();
    const { payload } = await jwtVerify(token, secret, {
      algorithms: [ALGORITHM],
    });

    return payload.role === "admin";
  } catch {
    log.warn("Admin session verification failed");
    return false;
  }
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  log.info("Admin session cleared");
}
