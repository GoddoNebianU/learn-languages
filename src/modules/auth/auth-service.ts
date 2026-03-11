import { auth } from "@/auth";
import {
    repoFindUserByUsername,
    repoFindUserById,
    repoDeleteUserCascade
} from "./auth-repository";
import {
    ServiceInputGetUserProfileByUsername,
    ServiceInputGetUserProfileById,
    ServiceInputSignIn,
    ServiceInputSignUp,
    ServiceInputDeleteAccount,
    ServiceOutputAuth,
    ServiceOutputUserProfile,
    ServiceOutputDeleteAccount
} from "./auth-service-dto";

/**
 * Sign up service
 */
export async function serviceSignUp(dto: ServiceInputSignUp): Promise<ServiceOutputAuth> {
    // Better-auth handles user creation internally
    const result = await auth.api.signUpEmail({
        body: {
            email: dto.email,
            password: dto.password,
            name: dto.name,
            username: dto.username,
        }
    });

    if (!result.user) {
        return {
            success: false,
        };
    }

    return {
        success: true,
    };
}

/**
 * Sign in service
 */
export async function serviceSignIn(dto: ServiceInputSignIn): Promise<ServiceOutputAuth> {
    // Try to sign in with username first
    const userResult = await repoFindUserByUsername({ username: dto.identifier });

    if (userResult) {
        // User found by username, use email signIn with the user's email
        const result = await auth.api.signInEmail({
            body: {
                email: userResult.email,
                password: dto.password,
            }
        });

        if (result.user) {
            return {
                success: true,
            };
        }
    } else {
        // Try as email
        const result = await auth.api.signInEmail({
            body: {
                email: dto.identifier,
                password: dto.password,
            }
        });

        if (result.user) {
            return {
                success: true,
            };
        }
    }

    return {
        success: false,
    };
}

/**
 * Get user profile by username
 */
export async function serviceGetUserProfileByUsername(dto: ServiceInputGetUserProfileByUsername): Promise<ServiceOutputUserProfile> {
    return await repoFindUserByUsername(dto);
}

/**
 * Get user profile by ID
 */
export async function serviceGetUserProfileById(dto: ServiceInputGetUserProfileById): Promise<ServiceOutputUserProfile> {
    return await repoFindUserById(dto);
}

export async function serviceDeleteAccount(dto: ServiceInputDeleteAccount): Promise<ServiceOutputDeleteAccount> {
    return await repoDeleteUserCascade({ userId: dto.userId });
}
