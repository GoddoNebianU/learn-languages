"use server";

import z from "zod";
import { getCurrentUserId } from "@/modules/shared/action-utils";
import { generateApiKey } from "./api-key-service";
import {
  repoCreateApiKey,
  repoListApiKeysByUserId,
  repoRevokeApiKey,
} from "./api-key-repository";

const createSchema = z.object({ name: z.string().min(1).max(100) });

export async function actionCreateApiKey(input: unknown) {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false as const, message: "Unauthorized" };

  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { success: false as const, message: "Name is required (max 100 chars)" };

  const { plaintext, keyHash, keyPrefix } = generateApiKey();
  const created = await repoCreateApiKey({
    name: parsed.data.name,
    keyHash,
    keyPrefix,
    userId,
  });

  return {
    success: true as const,
    message: "API key created",
    data: { id: created.id, plaintext, keyPrefix, name: created.name, createdAt: created.createdAt },
  };
}

export async function actionListApiKeys() {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false as const, message: "Unauthorized" };

  const keys = await repoListApiKeysByUserId(userId);
  return { success: true as const, message: "OK", data: keys };
}

export async function actionRevokeApiKey(id: string) {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false as const, message: "Unauthorized" };
  if (!id) return { success: false as const, message: "Key ID required" };

  await repoRevokeApiKey(id, userId);
  return { success: true as const, message: "API key revoked" };
}
