import { createLogger } from "@/lib/logger";
import {
  repoCheckFollow,
  repoToggleFollow,
  repoGetFollowers,
  repoGetFollowersCount,
  repoGetFollowing,
  repoGetFollowingCount,
} from "./follow-repository";
import type {
  ServiceInputCheckFollow,
  ServiceInputGetFollowers,
  ServiceInputGetFollowing,
  ServiceInputToggleFollow,
  ServiceOutputFollowStatus,
  ServiceOutputFollowWithUser,
  ServiceOutputToggleFollow,
} from "./follow-service-dto";

const log = createLogger("follow-service");

export async function serviceToggleFollow(
  dto: ServiceInputToggleFollow
): Promise<ServiceOutputToggleFollow> {
  const { currentUserId, targetUserId } = dto;

  if (currentUserId === targetUserId) {
    throw new Error("Cannot follow yourself");
  }

  const isFollowing = await repoToggleFollow({
    followerId: currentUserId,
    followingId: targetUserId,
  });

  log.info("Follow toggled", { currentUserId, targetUserId, isFollowing });

  const followersCount = await repoGetFollowersCount(targetUserId);

  return {
    isFollowing,
    followersCount,
  };
}

export async function serviceGetFollowStatus(
  dto: ServiceInputCheckFollow
): Promise<ServiceOutputFollowStatus> {
  const { currentUserId, targetUserId } = dto;

  const [isFollowing, followersCount, followingCount] = await Promise.all([
    currentUserId
      ? repoCheckFollow({ followerId: currentUserId, followingId: targetUserId })
      : false,
    repoGetFollowersCount(targetUserId),
    repoGetFollowingCount(targetUserId),
  ]);

  return {
    isFollowing,
    followersCount,
    followingCount,
  };
}

export async function serviceGetFollowers(
  dto: ServiceInputGetFollowers
): Promise<{ followers: ServiceOutputFollowWithUser[]; total: number }> {
  const { userId, page, limit } = dto;

  const [followers, total] = await Promise.all([
    repoGetFollowers({ userId, page, limit }),
    repoGetFollowersCount(userId),
  ]);

  return { followers, total };
}

export async function serviceGetFollowing(
  dto: ServiceInputGetFollowing
): Promise<{ following: ServiceOutputFollowWithUser[]; total: number }> {
  const { userId, page, limit } = dto;

  const [following, total] = await Promise.all([
    repoGetFollowing({ userId, page, limit }),
    repoGetFollowingCount(userId),
  ]);

  return { following, total };
}
