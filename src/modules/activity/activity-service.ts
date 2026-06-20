"use server";

import { headers } from "next/headers";
import { createLogger } from "@/lib/logger";
import { repoCreateActivity } from "./activity-repository";

const log = createLogger("activity-service");

export interface LogActivityParams {
  userId: string | null;
  action: string;
  entityType?: string;
  entityId?: string | number;
  metadata?: Record<string, unknown>;
  /** Override the request-derived IP (e.g. better-auth already captures it on sessions). */
  ip?: string | null;
  /** Override the request-derived user-agent. */
  userAgent?: string | null;
}

/**
 * Resolve the client IP from common proxy headers. Returns the leftmost
 * public-looking address from `x-forwarded-for`, falling back to `x-real-ip`.
 */
function resolveIp(forwardedFor: string | null, realIp: string | null): string | null {
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }
  return realIp ?? null;
}

/**
 * Record a user operation to the activity log.
 *
 * Captures request context (IP, user-agent) from the current request headers.
 * ALWAYS resolves successfully: any internal error is logged and swallowed so
 * that audit logging can never break the operation it is observing.
 */
export async function logActivity(params: LogActivityParams): Promise<void> {
  let headerIp: string | null = null;
  let headerUserAgent: string | null = null;
  try {
    const h = await headers();
    headerIp = resolveIp(h.get("x-forwarded-for"), h.get("x-real-ip"));
    headerUserAgent = h.get("user-agent");
  } catch {
    // No request context available (e.g. some DB-hook paths) — proceed without IP/UA.
  }

  const ip = params.ip !== undefined ? params.ip : headerIp;
  const userAgent = params.userAgent !== undefined ? params.userAgent : headerUserAgent;

  try {
    await repoCreateActivity({
      userId: params.userId,
      action: params.action,
      entityType: params.entityType ?? null,
      entityId: params.entityId != null ? String(params.entityId) : null,
      ip,
      userAgent,
      metadata: params.metadata,
    });
  } catch (e) {
    log.error("Failed to log activity", {
      error: e instanceof Error ? e.message : String(e),
      action: params.action,
    });
  }
}
