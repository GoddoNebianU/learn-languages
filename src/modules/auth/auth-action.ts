"use server";

import { auth } from "@/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ValidateError } from "@/lib/errors";
import {
    ActionInputGetUserProfileByUsername,
    ActionInputSignIn,
    ActionInputSignUp,
    ActionOutputAuth,
    ActionOutputUserProfile,
    validateActionInputGetUserProfileByUsername,
    validateActionInputSignIn,
    validateActionInputSignUp
} from "./auth-action-dto";
import {
    serviceGetUserProfileByUsername,
    serviceSignIn,
    serviceSignUp
} from "./auth-service";

// Re-export types for use in components
export type { ActionOutputAuth, ActionOutputUserProfile } from "./auth-action-dto";

/**
 * Sign up action
 * Creates a new user account
 */
export async function actionSignUp(prevState: ActionOutputAuth | undefined, formData: FormData): Promise<ActionOutputAuth> {
    try {
        // Extract form data
        const rawData = {
            email: formData.get("email") as string,
            username: formData.get("username") as string,
            password: formData.get("password") as string,
            redirectTo: formData.get("redirectTo") as string | undefined,
        };

        // Validate input
        const dto: ActionInputSignUp = validateActionInputSignUp(rawData);

        // Call service layer
        const result = await serviceSignUp({
            email: dto.email,
            username: dto.username,
            password: dto.password,
            name: dto.username,
        });

        if (!result.success) {
            return {
                success: false,
                message: "Registration failed. Email or username may already be taken.",
            };
        }

        // Redirect on success
        redirect(dto.redirectTo || "/");

    } catch (e) {
        if (e instanceof Error && e.message.includes('NEXT_REDIRECT')) {
            throw e;
        }
        if (e instanceof ValidateError) {
            return {
                success: false,
                message: e.message,
            };
        }
        console.error("Sign up error:", e);
        return {
            success: false,
            message: "Registration failed. Please try again later.",
        };
    }
}

/**
 * Sign in action
 * Authenticates a user
 */
export async function actionSignIn(_prevState: ActionOutputAuth | undefined, formData: FormData): Promise<ActionOutputAuth> {
    try {
        // Extract form data
        const rawData = {
            identifier: formData.get("identifier") as string,
            password: formData.get("password") as string,
            redirectTo: formData.get("redirectTo") as string | undefined,
        };

        // Validate input
        const dto: ActionInputSignIn = validateActionInputSignIn(rawData);

        // Call service layer
        const result = await serviceSignIn({
            identifier: dto.identifier,
            password: dto.password,
        });

        if (!result.success) {
            return {
                success: false,
                message: "Invalid email/username or password.",
                errors: {
                    identifier: ["Invalid email/username or password"],
                },
            };
        }

        // Redirect on success
        redirect(dto.redirectTo || "/");

    } catch (e) {
        if (e instanceof Error && e.message.includes('NEXT_REDIRECT')) {
            throw e;
        }
        if (e instanceof ValidateError) {
            return {
                success: false,
                message: e.message,
            };
        }
        console.error("Sign in error:", e);
        return {
            success: false,
            message: "Sign in failed. Please check your credentials.",
        };
    }
}

/**
 * Sign out action
 * Signs out the current user
 */
export async function signOutAction() {
    try {
        await auth.api.signOut({
            headers: await headers()
        });

        redirect("/login");
    } catch (e) {
        if (e instanceof Error && e.message.includes('NEXT_REDIRECT')) {
            throw e;
        }
        console.error("Sign out error:", e);
        redirect("/login");
    }
}

/**
 * Get user profile by username
 * Returns user profile data for display
 */
export async function actionGetUserProfileByUsername(dto: ActionInputGetUserProfileByUsername): Promise<ActionOutputUserProfile> {
    try {
        const userProfile = await serviceGetUserProfileByUsername(dto);

        if (!userProfile) {
            return {
                success: false,
                message: "User not found",
            };
        }

        return {
            success: true,
            message: "User profile retrieved successfully",
            data: userProfile,
        };
    } catch (e) {
        console.error("Get user profile error:", e);
        return {
            success: false,
            message: "Failed to retrieve user profile",
        };
    }
}
