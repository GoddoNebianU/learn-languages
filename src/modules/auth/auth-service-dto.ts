export type ServiceInputGetUserProfileByUsername = {
  username: string;
};

export type ServiceInputGetUserProfileById = {
  id: string;
};

export type ServiceOutputUserProfile = {
  id: string;
  email: string;
  emailVerified: boolean;
  username: string | null;
  displayUsername: string | null;
  image: string | null;
  bio: string | null;
  createdAt: Date;
  updatedAt: Date;
} | null;

export type ServiceInputDeleteAccount = {
  userId: string;
};

export type ServiceOutputDeleteAccount = {
  success: boolean;
};
