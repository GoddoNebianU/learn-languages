export type ServiceInputToggleFollow = {
  currentUserId: string;
  targetUserId: string;
};

export type ServiceInputGetFollowers = {
  userId: string;
  page?: number;
  limit?: number;
};

export type ServiceInputGetFollowing = {
  userId: string;
  page?: number;
  limit?: number;
};

export type ServiceInputCheckFollow = {
  currentUserId: string | null;
  targetUserId: string;
};

export type ServiceOutputFollowUser = {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
};

export type ServiceOutputFollowWithUser = {
  id: string;
  createdAt: Date;
  user: {
    id: string;
    username: string | null;
    displayUsername: string | null;
    image: string | null;
    bio: string | null;
  };
};

export type ServiceOutputFollowStatus = {
  isFollowing: boolean;
  followersCount: number;
  followingCount: number;
};

export type ServiceOutputToggleFollow = {
  isFollowing: boolean;
  followersCount: number;
};
