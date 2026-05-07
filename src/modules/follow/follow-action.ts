"use server";

import { validate } from "@/utils/validate";
import { getCurrentUserId } from "@/modules/shared/action-utils";
import {
  serviceGetFollowers,
  serviceGetFollowing,
  serviceGetFollowStatus,
  serviceToggleFollow,
} from "./follow-service";
import {
  schemaActionInputGetFollowers,
  schemaActionInputGetFollowing,
  schemaActionInputGetFollowStatus,
  schemaActionInputToggleFollow,
} from "./follow-action-dto";
import { createLogger } from "@/lib/logger";

const log = createLogger("follow-action");

export async function actionToggleFollow(input: unknown) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const dto = validate(input, schemaActionInputToggleFollow);
    const result = await serviceToggleFollow({
      currentUserId: userId,
      targetUserId: dto.targetUserId,
    });
    return { success: true, message: "Follow toggled successfully", data: result };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to toggle follow";
    log.error("Failed to toggle follow", { error });
    return { success: false, message };
  }
}

export async function actionGetFollowStatus(input: unknown) {
  const userId = await getCurrentUserId();

  try {
    const dto = validate(input, schemaActionInputGetFollowStatus);
    const result = await serviceGetFollowStatus({
      currentUserId: userId,
      targetUserId: dto.targetUserId,
    });
    return { success: true, message: "Follow status retrieved successfully", data: result };
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
    return { success: true, message: "Followers retrieved successfully", data: result };
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
    return { success: true, message: "Following retrieved successfully", data: result };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to get following";
    log.error("Failed to get following", { error });
    return { success: false, message };
  }
}
