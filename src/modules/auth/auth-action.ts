"use server";

import { auth } from "@/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ValidateError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";
import { prisma } from "@/lib/db";
import {
    ActionInputGetUserProfileByUsername,
    ActionInputSignIn,
    ActionInputSignUp,
    ActionOutputAuth,
    ActionOutputDeleteAccount,
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

const log = createLogger("auth-action");

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
        log.error("Sign up failed", { error: e });
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
        log.error("Sign in failed", { error: e });
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
        log.error("Sign out failed", { error: e });
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
        log.error("Get user profile failed", { error: e });
        return {
            success: false,
            message: "Failed to retrieve user profile",
        };
    }
}

/**
 * Delete account action
 * Permanently deletes the current user and all associated data
 */
export async function actionDeleteAccount(): Promise<ActionOutputDeleteAccount> {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return { success: false, message: "Unauthorized" };
        }

        const userId = session.user.id;

        await prisma.$transaction(async (tx) => {
            // Delete in correct order to avoid foreign key constraints
            // 1. Revlogs (depend on cards)
            await tx.revlog.deleteMany({
                where: { card: { note: { userId } } }
            });

            // 2. Cards (depend on notes and decks)
            await tx.card.deleteMany({
                where: { note: { userId } }
            });

            // 3. Notes (depend on note types)
            await tx.note.deleteMany({
                where: { userId }
            });

            // 4. Note types
            await tx.noteType.deleteMany({
                where: { userId }
            });

            // 5. Deck favorites
            await tx.deckFavorite.deleteMany({
                where: { userId }
            });

            // 6. Decks
            await tx.deck.deleteMany({
                where: { userId }
            });

            // 7. Follows (both as follower and following)
            await tx.follow.deleteMany({
                where: {
                    OR: [
                        { followerId: userId },
                        { followingId: userId }
                    ]
                }
            });

            // 8. Dictionary lookups
            await tx.dictionaryLookUp.deleteMany({
                where: { userId }
            });

            // 9. Translation history
            await tx.translationHistory.deleteMany({
                where: { userId }
            });

            // 10. Sessions
            await tx.session.deleteMany({
                where: { userId }
            });

            // 11. Accounts
            await tx.account.deleteMany({
                where: { userId }
            });

            // 12. Finally, delete the user
            await tx.user.delete({
                where: { id: userId }
            });
        });

        return { success: true, message: "Account deleted successfully" };
    } catch (e) {
        log.error("Delete account failed", { error: e });
        return { success: false, message: "Failed to delete account" };
    }
}
