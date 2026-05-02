"use server";

import { auth } from "@/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createLogger } from "@/lib/logger";
import {
  ActionInputGetUserProfileByUsername,
  ActionOutputDeleteAccount,
  ActionOutputUserProfile,
  validateActionInputGetUserProfileByUsername,
} from "./auth-action-dto";
import {
  serviceGetUserProfileByUsername,
  serviceDeleteAccount,
} from "./auth-service";

export type { ActionOutputUserProfile } from "./auth-action-dto";

const log = createLogger("auth-action");

export async function signOutAction() {
  try {
    await auth.api.signOut({
      headers: await headers(),
    });

    redirect("/login");
  } catch (e) {
    if (e instanceof Error && e.message.includes("NEXT_REDIRECT")) {
      throw e;
    }
    log.error("Sign out failed", { error: e });
    redirect("/login");
  }
}

export async function actionGetUserProfileByUsername(
  dto: ActionInputGetUserProfileByUsername
): Promise<ActionOutputUserProfile> {
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

export async function actionDeleteAccount(): Promise<ActionOutputDeleteAccount> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    // Sign out first while session still exists in DB
    try {
      await auth.api.signOut({ headers: await headers() });
    } catch {
      // SignOut failure shouldn't block account deletion
    }

    const result = await serviceDeleteAccount({ userId: session.user.id });

    if (!result.success) {
      return { success: false, message: "Failed to delete account" };
    }

    return { success: true, message: "Account deleted successfully" };
  } catch (e) {
    log.error("Delete account failed", { error: e });
    return { success: false, message: "Failed to delete account" };
  }
}
