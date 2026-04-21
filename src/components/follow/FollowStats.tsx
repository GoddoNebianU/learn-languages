"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { FollowButton } from "./FollowButton";

interface FollowStatsProps {
  userId: string;
  initialFollowersCount: number;
  initialFollowingCount: number;
  initialIsFollowing: boolean;
  currentUserId?: string;
  isOwnProfile: boolean;
  username: string;
}

export function FollowStats({
  userId,
  initialFollowersCount,
  initialFollowingCount,
  initialIsFollowing,
  currentUserId,
  isOwnProfile,
  username,
}: FollowStatsProps) {
  const [followersCount, setFollowersCount] = useState(initialFollowersCount);
  const [followingCount, setFollowingCount] = useState(initialFollowingCount);
  const t = useTranslations("follow");

  const handleFollowChange = (isFollowing: boolean, count: number) => {
    setFollowersCount(count);
    setFollowingCount((prev) => (isFollowing ? prev + 1 : prev - 1));
  };

  return (
    <div className="flex items-center gap-4">
      <a
        href={`/users/${username}/followers`}
        className="text-sm text-gray-600 hover:text-primary-500 transition-colors"
      >
        <span className="font-semibold text-gray-900">{followersCount}</span> {t("followers")}
      </a>
      <a
        href={`/users/${username}/following`}
        className="text-sm text-gray-600 hover:text-primary-500 transition-colors"
      >
        <span className="font-semibold text-gray-900">{followingCount}</span> {t("following")}
      </a>
      {currentUserId && !isOwnProfile && (
        <FollowButton
          targetUserId={userId}
          initialIsFollowing={initialIsFollowing}
          onFollowChange={handleFollowChange}
        />
      )}
    </div>
  );
}
