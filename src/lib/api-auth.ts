import { prisma } from "./db";
import { hashApiKey } from "@/modules/api-key/api-key-service";

/**
 * Verify a Bearer API key from a REST request. Returns userId if valid, null otherwise.
 * Updates lastUsedAt (fire-and-forget).
 */
export async function getApiUserId(request: Request): Promise<string | null> {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;

  const token = auth.slice(7);
  if (!token.startsWith("ll_")) return null;

  const keyHash = hashApiKey(token);
  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash },
    select: { id: true, userId: true, revokedAt: true, expiresAt: true },
  });

  if (!apiKey || apiKey.revokedAt) return null;
  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) return null;

  void prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  });

  return apiKey.userId;
}
