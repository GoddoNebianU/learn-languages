import { prisma } from "@/lib/db";
import type { RepoInputCreateApiKey, RepoOutputApiKey } from "./api-key-repository-dto";

export async function repoCreateApiKey(input: RepoInputCreateApiKey): Promise<RepoOutputApiKey> {
  return prisma.apiKey.create({
    data: {
      name: input.name,
      keyHash: input.keyHash,
      keyPrefix: input.keyPrefix,
      userId: input.userId,
    },
  });
}

export async function repoListApiKeysByUserId(userId: string): Promise<RepoOutputApiKey[]> {
  return prisma.apiKey.findMany({
    where: { userId, revokedAt: null },
    orderBy: { createdAt: "desc" },
  });
}

export async function repoFindApiKeyByHash(keyHash: string) {
  return prisma.apiKey.findUnique({
    where: { keyHash },
    select: { id: true, userId: true, revokedAt: true, expiresAt: true },
  });
}

export async function repoRevokeApiKey(id: string, userId: string): Promise<void> {
  await prisma.apiKey.updateMany({
    where: { id, userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function repoTouchApiKey(id: string): Promise<void> {
  await prisma.apiKey.update({
    where: { id },
    data: { lastUsedAt: new Date() },
  }).catch(() => {});
}
