"use client";

import { useState } from "react";
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

  const handleFollowChange = (isFollowing: boolean, count: number) => {
    setFollowersCount(count);
  };

  return (
    <div className="flex items-center gap-4">
      <a
        href={`/users/${username}/followers`}
        className="text-sm text-gray-600 hover:text-primary-500 transition-colors"
      >
        <span className="font-semibold text-gray-900">{followersCount}</span> followers
      </a>
      <a
        href={`/users/${username}/following`}
        className="text-sm text-gray-600 hover:text-primary-500 transition-colors"
      >
        <span className="font-semibold text-gray-900">{initialFollowingCount}</span> following
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
