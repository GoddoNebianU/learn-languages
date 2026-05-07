"use server-headers";

import { isSingleUserMode, getSingleUserId } from "@/lib/auth-mode";
import { headers } from "next/headers";
import { createLogger } from "@/lib/logger";

const log = createLogger("shared-action-utils");

export async function getCurrentUserId(): Promise<string | null> {
  if (isSingleUserMode()) {
    return getSingleUserId();
  }

  const { auth } = await import("@/auth");
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    log.warn("Unauthenticated access attempt");
    return null;
  }
  return session.user.id;
}

export async function requireAuth(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) {
    log.warn("Authentication required but rejected");
    throw new Error("Unauthorized");
  }
  return userId;
}
