// Service layer DTOs for auth module - User profile operations

// Sign up input/output
export type ServiceInputSignUp = {
    email: string;
    username: string;
    password: string;
    name: string;
};

export type ServiceOutputAuth = {
    success: boolean;
};

// Sign in input/output
export type ServiceInputSignIn = {
    identifier: string;
    password: string;
};

// Get user profile input/output
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
    createdAt: Date;
    updatedAt: Date;
} | null;
