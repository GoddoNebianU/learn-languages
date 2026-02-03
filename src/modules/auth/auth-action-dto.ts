import z from "zod";
import { generateValidator } from "@/utils/validate";
import { LENGTH_MAX_PASSWORD, LENGTH_MAX_USERNAME, LENGTH_MIN_PASSWORD, LENGTH_MIN_USERNAME } from "@/shared/constant";

// Schema for sign up
const schemaActionInputSignUp = z.object({
    email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"),
    username: z.string().min(LENGTH_MIN_USERNAME).max(LENGTH_MAX_USERNAME).regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    password: z.string().min(LENGTH_MIN_PASSWORD).max(LENGTH_MAX_PASSWORD),
    redirectTo: z.string().nullish(),
});

export type ActionInputSignUp = z.infer<typeof schemaActionInputSignUp>;

export const validateActionInputSignUp = generateValidator(schemaActionInputSignUp);

// Schema for sign in
const schemaActionInputSignIn = z.object({
    identifier: z.string().min(1), // Can be email or username
    password: z.string().min(LENGTH_MIN_PASSWORD).max(LENGTH_MAX_PASSWORD),
    redirectTo: z.string().nullish(),
});

export type ActionInputSignIn = z.infer<typeof schemaActionInputSignIn>;

export const validateActionInputSignIn = generateValidator(schemaActionInputSignIn);

// Schema for sign out
const schemaActionInputSignOut = z.object({
    redirectTo: z.string().nullish(),
});

export type ActionInputSignOut = z.infer<typeof schemaActionInputSignOut>;

export const validateActionInputSignOut = generateValidator(schemaActionInputSignOut);

// Output types
export type ActionOutputAuth = {
    success: boolean;
    message: string;
    errors?: {
        username?: string[];
        email?: string[];
        password?: string[];
        identifier?: string[];
    };
};
