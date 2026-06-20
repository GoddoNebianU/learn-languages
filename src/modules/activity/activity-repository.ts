import { prisma } from "@/lib/db";
import { Prisma } from "../../../generated/prisma/client";
import { createLogger } from "@/lib/logger";

const log = createLogger("activity-repository");

interface RepoInputCreateActivity {
  userId: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  ip: string | null;
  userAgent: string | null;
  metadata?: Record<string, unknown>;
}

export async function repoCreateActivity(input: RepoInputCreateActivity): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        userId: input.userId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        ip: input.ip,
        userAgent: input.userAgent,
        metadata: input.metadata
          ? (input.metadata as Prisma.InputJsonValue)
          : Prisma.JsonNull,
      },
    });
  } catch (e) {
    // Swallow repository errors: the audit log must never break the host operation.
    log.error("Failed to persist activity record", {
      error: e instanceof Error ? e.message : String(e),
      action: input.action,
    });
  }
}
