"use client";

import { useState, useTransition } from "react";
import { Button } from "@/design-system/base/button";
import { actionToggleFollow } from "@/modules/follow/follow-action";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("follow");

  const handleToggleFollow = () => {
    startTransition(async () => {
      const result = await actionToggleFollow({ targetUserId });
      if (result.success && result.data) {
        setIsFollowing(result.data.isFollowing);
        onFollowChange?.(result.data.isFollowing, result.data.followersCount);
      } else {
        toast.error(result.message || t("followFailed"));
      }
    });
  };

  if (isFollowing) {
    return (
      <Button variant="secondary" onClick={handleToggleFollow} disabled={isPending}>
        {isPending ? "..." : t("following")}
      </Button>
    );
  }

  return (
    <Button variant="primary" onClick={handleToggleFollow} disabled={isPending}>
      {isPending ? "..." : t("follow")}
    </Button>
  );
}
