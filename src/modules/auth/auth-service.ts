import { auth } from "@/auth";
import {
    ServiceInputSignUp,
    ServiceInputSignIn,
    ServiceOutputSignUp,
    ServiceOutputSignIn
} from "./auth-service-dto";

/**
 * Sign up a new user
 * Calls better-auth's signUp.email with username support
 */
export async function serviceSignUp(dto: ServiceInputSignUp): Promise<ServiceOutputSignUp> {
    try {
        await auth.api.signUpEmail({
            body: {
                email: dto.email,
                password: dto.password,
                username: dto.username,
                name: dto.name,
            }
        });

        return {
            success: true,
            email: dto.email,
            username: dto.username,
        };
    } catch (error) {
        // better-auth handles duplicates and validation errors
        return {
            success: false,
        };
    }
}

/**
 * Sign in user
 * Uses better-auth's signIn.username for username-based authentication
 */
export async function serviceSignIn(dto: ServiceInputSignIn): Promise<ServiceOutputSignIn> {
    try {
        // Determine if identifier is email or username
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dto.identifier);

        let session;

        if (isEmail) {
            // Use email sign in
            session = await auth.api.signInEmail({
                body: {
                    email: dto.identifier,
                    password: dto.password,
                }
            });
        } else {
            // Use username sign in (requires username plugin)
            session = await auth.api.signInUsername({
                body: {
                    username: dto.identifier,
                    password: dto.password,
                }
            });
        }

        return {
            success: true,
            sessionToken: session?.token,
        };
    } catch (error) {
        // better-auth throws on invalid credentials
        return {
            success: false,
        };
    }
}
