// Service layer DTOs for auth module

// Sign up input/output
export type ServiceInputSignUp = {
    email: string;
    username: string;
    password: string; // plain text, will be hashed by better-auth
    name: string;
};

export type ServiceOutputSignUp = {
    success: boolean;
    userId?: string;
    email?: string;
    username?: string;
};

// Sign in input/output
export type ServiceInputSignIn = {
    identifier: string; // email or username
    password: string;
};

export type ServiceOutputSignIn = {
    success: boolean;
    userId?: string;
    email?: string;
    username?: string;
    sessionToken?: string;
};

// Sign out input/output
export type ServiceInputSignOut = {
    sessionId?: string;
};

export type ServiceOutputSignOut = {
    success: boolean;
};

// User existence check
export type ServiceInputCheckUserExists = {
    email?: string;
    username?: string;
};

export type ServiceOutputCheckUserExists = {
    emailExists: boolean;
    usernameExists: boolean;
};
