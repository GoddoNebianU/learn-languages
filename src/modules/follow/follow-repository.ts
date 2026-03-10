import { prisma } from "@/lib/db";
import { createLogger } from "@/lib/logger";
import type {
  RepoInputCheckFollow,
  RepoInputCreateFollow,
  RepoInputDeleteFollow,
  RepoInputGetFollowers,
  RepoInputGetFollowing,
  RepoOutputFollowerCount,
  RepoOutputFollowUser,
  RepoOutputFollowWithUser,
  RepoOutputFollowingCount,
  RepoOutputIsFollowing,
} from "./follow-repository-dto";

const log = createLogger("follow-repository");

export async function repoCreateFollow(
  dto: RepoInputCreateFollow
): Promise<RepoOutputFollowUser> {
  log.debug("Creating follow", { followerId: dto.followerId, followingId: dto.followingId });

  const follow = await prisma.follow.create({
    data: {
      followerId: dto.followerId,
      followingId: dto.followingId,
    },
  });

  log.info("Follow created", { followId: follow.id });
  return follow;
}

export async function repoDeleteFollow(
  dto: RepoInputDeleteFollow
): Promise<void> {
  log.debug("Deleting follow", { followerId: dto.followerId, followingId: dto.followingId });

  await prisma.follow.delete({
    where: {
      followerId_followingId: {
        followerId: dto.followerId,
        followingId: dto.followingId,
      },
    },
  });

  log.info("Follow deleted");
}

export async function repoCheckFollow(
  dto: RepoInputCheckFollow
): Promise<RepoOutputIsFollowing> {
  const follow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: dto.followerId,
        followingId: dto.followingId,
      },
    },
  });

  return !!follow;
}

export async function repoGetFollowersCount(userId: string): Promise<RepoOutputFollowerCount> {
  return prisma.follow.count({
    where: { followingId: userId },
  });
}

export async function repoGetFollowingCount(userId: string): Promise<RepoOutputFollowingCount> {
  return prisma.follow.count({
    where: { followerId: userId },
  });
}

export async function repoGetFollowers(
  dto: RepoInputGetFollowers
): Promise<RepoOutputFollowWithUser[]> {
  const { userId, page = 1, limit = 20 } = dto;
  const skip = (page - 1) * limit;

  const follows = await prisma.follow.findMany({
    where: { followingId: userId },
    include: {
      follower: {
        select: {
          id: true,
          username: true,
          displayUsername: true,
          image: true,
          bio: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    skip,
    take: limit,
  });

  return follows.map((f) => ({
    id: f.id,
    followerId: f.followerId,
    followingId: f.followingId,
    createdAt: f.createdAt,
    user: f.follower,
  }));
}

export async function repoGetFollowing(
  dto: RepoInputGetFollowing
): Promise<RepoOutputFollowWithUser[]> {
  const { userId, page = 1, limit = 20 } = dto;
  const skip = (page - 1) * limit;

  const follows = await prisma.follow.findMany({
    where: { followerId: userId },
    include: {
      following: {
        select: {
          id: true,
          username: true,
          displayUsername: true,
          image: true,
          bio: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    skip,
    take: limit,
  });

  return follows.map((f) => ({
    id: f.id,
    followerId: f.followerId,
    followingId: f.followingId,
    createdAt: f.createdAt,
    user: f.following,
  }));
}
