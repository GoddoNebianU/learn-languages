export type RepoInputCreateFollow = {
  followerId: string;
  followingId: string;
};

export type RepoInputDeleteFollow = {
  followerId: string;
  followingId: string;
};

export type RepoInputCheckFollow = {
  followerId: string;
  followingId: string;
};

export type RepoInputGetFollowers = {
  userId: string;
  page?: number;
  limit?: number;
};

export type RepoInputGetFollowing = {
  userId: string;
  page?: number;
  limit?: number;
};

export type RepoOutputFollowUser = {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
};

export type RepoOutputFollowWithUser = {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
  user: {
    id: string;
    username: string | null;
    displayUsername: string | null;
    image: string | null;
    bio: string | null;
  };
};

export type RepoOutputFollowerCount = number;
export type RepoOutputFollowingCount = number;
export type RepoOutputIsFollowing = boolean;
