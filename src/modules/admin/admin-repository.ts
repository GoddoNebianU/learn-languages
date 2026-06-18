import { prisma } from "@/lib/db";
import { Prisma } from "../../../generated/prisma/client";
import { createLogger } from "@/lib/logger";

const log = createLogger("admin-repository");

// --- Types ---

export interface Capabilities {
  signup: boolean;
  userProfile: boolean;
  social: boolean;
  email: boolean;
}

export interface RepoOutputSystemConfig {
  id: number;
  signup: boolean;
  userProfile: boolean;
  social: boolean;
  email: boolean;
  services: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
}

export interface RepoInputUpdateSystemConfig {
  services: Record<string, unknown>;
  capabilities: Capabilities;
}

// --- SystemConfig ---

export async function repoGetSystemConfig(): Promise<RepoOutputSystemConfig | null> {
  const config = await prisma.systemConfig.findUnique({ where: { id: 1 } });
  return config;
}

export async function repoUpdateSystemConfig(input: RepoInputUpdateSystemConfig): Promise<void> {
  await prisma.systemConfig.upsert({
    where: { id: 1 },
    update: {
      signup: input.capabilities.signup,
      userProfile: input.capabilities.userProfile,
      social: input.capabilities.social,
      email: input.capabilities.email,
      services: input.services as Prisma.InputJsonValue,
    },
    create: {
      id: 1,
      signup: input.capabilities.signup,
      userProfile: input.capabilities.userProfile,
      social: input.capabilities.social,
      email: input.capabilities.email,
      services: input.services as Prisma.InputJsonValue,
    },
  });
  log.info("SystemConfig updated");
}

// --- User Management ---

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  username: string;
  emailVerified: boolean;
  createdAt: Date;
}

const ADMIN_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  username: true,
  emailVerified: true,
  createdAt: true,
} as const;

export async function repoListUsers(search?: string): Promise<AdminUserRow[]> {
  return prisma.user.findMany({
    where: search
      ? {
          OR: [
            { username: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : undefined,
    select: ADMIN_USER_SELECT,
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}

export async function repoCheckUserExists(
  email: string,
  username: string
): Promise<{ email: boolean; username: boolean }> {
  const [byEmail, byUsername] = await Promise.all([
    prisma.user.findUnique({ where: { email }, select: { id: true } }),
    prisma.user.findUnique({ where: { username }, select: { id: true } }),
  ]);
  return { email: !!byEmail, username: !!byUsername };
}

export interface RepoInputCreateUser {
  id: string;
  accountId: string;
  name: string;
  email: string;
  username: string;
  passwordHash: string;
  emailVerified: boolean;
}

export async function repoCreateUser(input: RepoInputCreateUser): Promise<AdminUserRow> {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        id: input.id,
        name: input.name,
        email: input.email,
        username: input.username,
        emailVerified: input.emailVerified,
      },
      select: ADMIN_USER_SELECT,
    });
    await tx.account.create({
      data: {
        id: input.accountId,
        userId: user.id,
        providerId: "credential",
        accountId: user.id,
        password: input.passwordHash,
      },
    });
    log.info("User created", { userId: user.id, username: user.username });
    return user;
  });
}

export async function repoDeleteUserCascade(userId: string): Promise<void> {
  log.info("Cascade delete user", { userId });
  await prisma.$transaction(async (tx) => {
    await tx.card.deleteMany({ where: { deck: { userId } } });
    await tx.deckFavorite.deleteMany({ where: { userId } });
    await tx.deck.deleteMany({ where: { userId } });
    await tx.follow.deleteMany({
      where: { OR: [{ followerId: userId }, { followingId: userId }] },
    });
    await tx.session.deleteMany({ where: { userId } });
    await tx.account.deleteMany({ where: { userId } });
    await tx.user.delete({ where: { id: userId } });
  });
  log.info("User deleted", { userId });
}

export async function repoSetUserEmailVerified(
  userId: string,
  verified: boolean
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { emailVerified: verified },
  });
  log.info("User emailVerified updated", { userId, verified });
}

export interface RepoInputUpdateUser {
  userId: string;
  name: string;
  email: string;
  username: string;
}

export async function repoCheckUserConflict(
  email: string,
  username: string,
  excludeUserId: string
): Promise<{ email: boolean; username: boolean }> {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }], NOT: { id: excludeUserId } },
    select: { email: true, username: true },
  });
  if (!existing) return { email: false, username: false };
  return { email: existing.email === email, username: existing.username === username };
}

export async function repoUpdateUser(input: RepoInputUpdateUser): Promise<void> {
  await prisma.user.update({
    where: { id: input.userId },
    data: { name: input.name, email: input.email, username: input.username },
  });
  log.info("User updated", { userId: input.userId });
}

export async function repoUpdateUserPassword(
  userId: string,
  passwordHash: string
): Promise<void> {
  await prisma.account.updateMany({
    where: { userId, providerId: "credential" },
    data: { password: passwordHash },
  });
  log.info("User password updated", { userId });
}

export async function repoGetUserUsername(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { username: true },
  });
  return user?.username ?? null;
}
