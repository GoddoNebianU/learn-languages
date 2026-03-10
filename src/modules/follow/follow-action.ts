"use server";

import { auth } from "@/auth";
import { headers } from "next/headers";
import { validate } from "@/utils/validate";
import { serviceGetFollowers, serviceGetFollowing, serviceGetFollowStatus, serviceToggleFollow } from "./follow-service";
import {
  schemaActionInputGetFollowers,
  schemaActionInputGetFollowing,
  schemaActionInputGetFollowStatus,
  schemaActionInputToggleFollow,
} from "./follow-action-dto";
import { createLogger } from "@/lib/logger";

const log = createLogger("follow-action");

export async function actionToggleFollow(input: unknown) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const dto = validate(input, schemaActionInputToggleFollow);
    const result = await serviceToggleFollow({
      currentUserId: session.user.id,
      targetUserId: dto.targetUserId,
    });
    return { success: true, data: result };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to toggle follow";
    log.error("Failed to toggle follow", { error });
    return { success: false, message };
  }
}

export async function actionGetFollowStatus(input: unknown) {
  const session = await auth.api.getSession({ headers: await headers() });

  try {
    const dto = validate(input, schemaActionInputGetFollowStatus);
    const result = await serviceGetFollowStatus({
      currentUserId: session?.user?.id || "",
      targetUserId: dto.targetUserId,
    });
    return { success: true, data: result };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to get follow status";
    log.error("Failed to get follow status", { error });
    return { success: false, message };
  }
}

export async function actionGetFollowers(input: unknown) {
  try {
    const dto = validate(input, schemaActionInputGetFollowers);
    const result = await serviceGetFollowers({
      userId: dto.userId,
      page: dto.page,
      limit: dto.limit,
    });
    return { success: true, data: result };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to get followers";
    log.error("Failed to get followers", { error });
    return { success: false, message };
  }
}

export async function actionGetFollowing(input: unknown) {
  try {
    const dto = validate(input, schemaActionInputGetFollowing);
    const result = await serviceGetFollowing({
      userId: dto.userId,
      page: dto.page,
      limit: dto.limit,
    });
    return { success: true, data: result };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to get following";
    log.error("Failed to get following", { error });
    return { success: false, message };
  }
}
