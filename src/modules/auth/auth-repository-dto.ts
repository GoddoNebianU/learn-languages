// Repository layer DTOs for auth module - User profile operations

// User profile data types
export type RepoOutputUserProfile = {
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

// Input types
export type RepoInputFindUserByUsername = {
    username: string;
};

export type RepoInputFindUserById = {
    id: string;
};

export type RepoInputFindUserByEmail = {
    email: string;
};
