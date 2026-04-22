import z from "zod";
import { generateValidator } from "@/utils/validate";
import { LENGTH_MAX_USERNAME, LENGTH_MIN_USERNAME } from "@/shared/constant";

// Schema for sign up
const schemaActionInputSignUp = z.object({
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"),
  username: z
    .string()
    .min(LENGTH_MIN_USERNAME)
    .max(LENGTH_MAX_USERNAME)
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  password: z.string().min(8).max(100),
  redirectTo: z.string().nullish(),
});

export type ActionInputSignUp = z.infer<typeof schemaActionInputSignUp>;

export const validateActionInputSignUp = generateValidator(schemaActionInputSignUp);

// Schema for sign in
const schemaActionInputSignIn = z.object({
  identifier: z.string().min(1), // Can be email or username
  password: z.string().min(8).max(100),
  redirectTo: z.string().nullish(),
});

export type ActionInputSignIn = z.infer<typeof schemaActionInputSignIn>;

export const validateActionInputSignIn = generateValidator(schemaActionInputSignIn);

// Schema for get user profile by username
const schemaActionInputGetUserProfileByUsername = z.object({
  username: z.string().min(LENGTH_MIN_USERNAME).max(LENGTH_MAX_USERNAME),
});

export type ActionInputGetUserProfileByUsername = z.infer<
  typeof schemaActionInputGetUserProfileByUsername
>;

export const validateActionInputGetUserProfileByUsername = generateValidator(
  schemaActionInputGetUserProfileByUsername
);

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

export type ActionOutputUserProfile = {
  success: boolean;
  message: string;
  data?: {
    id: string;
    email: string;
    emailVerified: boolean;
    username: string | null;
    displayUsername: string | null;
    image: string | null;
    bio: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
};

export type ActionOutputDeleteAccount = {
  success: boolean;
  message: string;
};
