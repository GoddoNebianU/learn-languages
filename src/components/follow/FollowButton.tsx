"use client";

import { useState, useTransition } from "react";
import { PrimaryButton, LightButton } from "@/design-system/base/button";
import { actionToggleFollow } from "@/modules/follow/follow-action";
import { toast } from "sonner";

interface FollowButtonProps {
  targetUserId: string;
  initialIsFollowing: boolean;
  onFollowChange?: (isFollowing: boolean, followersCount: number) => void;
}

export function FollowButton({
  targetUserId,
  initialIsFollowing,
  onFollowChange,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isPending, startTransition] = useTransition();

  const handleToggleFollow = () => {
    startTransition(async () => {
      const result = await actionToggleFollow({ targetUserId });
      if (result.success && result.data) {
        setIsFollowing(result.data.isFollowing);
        onFollowChange?.(result.data.isFollowing, result.data.followersCount);
      } else {
        toast.error(result.message || "Failed to update follow status");
      }
    });
  };

  if (isFollowing) {
    return (
      <LightButton onClick={handleToggleFollow} disabled={isPending}>
        {isPending ? "..." : "Following"}
      </LightButton>
    );
  }

  return (
    <PrimaryButton onClick={handleToggleFollow} disabled={isPending}>
      {isPending ? "..." : "Follow"}
    </PrimaryButton>
  );
}
