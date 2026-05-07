import { prisma } from "./db";
import { createLogger } from "./logger";
import { randomUUID } from "crypto";

const log = createLogger("auth-mode");

const SINGLE_USER_USERNAME = "admin";

export function isSingleUserMode(): boolean {
  return process.env.NEXT_PUBLIC_AUTH_MODE === "single";
}

let _singleUserId: string | null = null;

export async function getSingleUserId(): Promise<string> {
  if (_singleUserId) return _singleUserId;

  const existing = await prisma.user.findUnique({
    where: { username: SINGLE_USER_USERNAME },
    select: { id: true },
  });

  if (existing) {
    _singleUserId = existing.id;
    return existing.id;
  }

  try {
    const user = await prisma.user.create({
      data: {
        id: randomUUID(),
        name: "Admin",
        email: "admin@localhost",
        username: SINGLE_USER_USERNAME,
        emailVerified: true,
      },
    });
    log.info("Auto-created single user", {
      username: user.username,
      id: user.id,
    });
    _singleUserId = user.id;
    return user.id;
  } catch {
    // Race condition: another request created the user first
    const user = await prisma.user.findUniqueOrThrow({
      where: { username: SINGLE_USER_USERNAME },
      select: { id: true },
    });
    _singleUserId = user.id;
    return user.id;
  }
}
