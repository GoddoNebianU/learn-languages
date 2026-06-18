import { randomUUID } from "crypto";
import { hashPassword } from "better-auth/crypto";
import { createLogger } from "@/lib/logger";
import { invalidateCapabilityCache } from "@/lib/capability";
import {
  repoGetSystemConfig,
  repoUpdateSystemConfig,
  repoCheckUserExists,
  repoCreateUser,
  repoDeleteUserCascade,
  repoSetUserEmailVerified,
  repoCheckUserConflict,
  repoUpdateUser,
  repoUpdateUserPassword,
  repoGetUserUsername,
} from "./admin-repository";
import type { Capabilities, AdminUserRow } from "./admin-repository";

const log = createLogger("admin-service");

const DEFAULT_CAPABILITIES: Capabilities = {
  signup: true,
  userProfile: true,
  social: true,
  email: true,
};

// --- H4: secret masking helpers ---

export const SECRET_MASK = "••••••••";

export function maskSecret(value: string | undefined | null): string {
  return value && value.length > 0 ? SECRET_MASK : "";
}

export function preserveSecret(incoming: string, current: string | undefined): string {
  if (incoming === SECRET_MASK) {
    return current ?? "";
  }
  return incoming;
}

// --- Service types ---

export interface ServiceInputUpdateAdminSettings {
  capabilities?: Capabilities;
  services?: {
    llm?: { apiKey: string; apiUrl: string; modelName: string };
    tts?: {
      apiKey: string;
      primaryUrl: string;
      primaryUsername: string;
      primaryPassword: string;
    };
    smtp?: {
      host: string;
      port: number;
      secure: boolean;
      user: string;
      pass: string;
      from: string;
    };
  };
}

export interface AdminSettingsData {
  capabilities: Capabilities;
  services: {
    llm: {
      apiKey: string;
      apiUrl: string;
      modelName: string;
    };
    tts: {
      apiKey: string;
      primaryUrl: string;
      primaryUsername: string;
      primaryPassword: string;
    };
    smtp: {
      host: string;
      port: number;
      secure: boolean;
      user: string;
      pass: string;
      from: string;
    };
  };
}

// --- Service functions ---

export async function serviceGetAdminSettings(): Promise<{
  success: boolean;
  message: string;
  data?: AdminSettingsData;
}> {
  try {
    let config = await repoGetSystemConfig();
    if (!config) {
      await repoUpdateSystemConfig({ services: {}, capabilities: DEFAULT_CAPABILITIES });
      config = await repoGetSystemConfig();
      if (!config) {
        return { success: false, message: "Failed to initialize system config" };
      }
      log.info("Auto-created default SystemConfig");
    }

    const services = (config.services ?? {}) as Record<string, unknown>;
    const llm = (services.llm ?? {}) as Record<string, string>;
    const tts = (services.tts ?? {}) as Record<string, string>;
    const smtp = (services.smtp ?? {}) as Record<string, unknown>;

    return {
      success: true,
      message: "Settings loaded",
      data: {
        capabilities: {
          signup: config.signup,
          userProfile: config.userProfile,
          social: config.social,
          email: config.email,
        },
        services: {
          llm: {
            apiKey: maskSecret(llm.apiKey),
            apiUrl: llm.apiUrl ?? "",
            modelName: llm.modelName ?? "",
          },
          tts: {
            apiKey: maskSecret(tts.apiKey),
            primaryUrl: tts.primaryUrl ?? "",
            primaryUsername: tts.primaryUsername ?? "",
            primaryPassword: maskSecret(tts.primaryPassword),
          },
          smtp: {
            host: (smtp.host as string) ?? "",
            port: (smtp.port as number) ?? 587,
            secure: (smtp.secure as boolean) ?? false,
            user: (smtp.user as string) ?? "",
            pass: maskSecret(smtp.pass as string | undefined),
            from: (smtp.from as string) ?? "",
          },
        },
      },
    };
  } catch (error) {
    log.error("Failed to load admin settings", { error: String(error) });
    return { success: false, message: "Failed to load settings" };
  }
}

export async function serviceUpdateAdminSettings(
  input: ServiceInputUpdateAdminSettings
): Promise<{ success: boolean; message: string }> {
  try {
    const config = await repoGetSystemConfig();
    const currentServices = (config?.services ?? {}) as Record<string, unknown>;
    const currentCaps: Capabilities = config
      ? {
          signup: config.signup,
          userProfile: config.userProfile,
          social: config.social,
          email: config.email,
        }
      : DEFAULT_CAPABILITIES;

    const currentLlm = (currentServices.llm ?? {}) as Record<string, string>;
    const currentTts = (currentServices.tts ?? {}) as Record<string, string>;
    const currentSmtp = (currentServices.smtp ?? {}) as Record<string, unknown>;

    const mergedServices: Record<string, unknown> = { ...currentServices };
    if (input.services?.llm) {
      mergedServices.llm = {
        ...input.services.llm,
        apiKey: preserveSecret(input.services.llm.apiKey, currentLlm.apiKey),
      };
    }
    if (input.services?.tts) {
      mergedServices.tts = {
        ...input.services.tts,
        apiKey: preserveSecret(input.services.tts.apiKey, currentTts.apiKey),
        primaryPassword: preserveSecret(
          input.services.tts.primaryPassword,
          currentTts.primaryPassword
        ),
      };
    }
    if (input.services?.smtp) {
      mergedServices.smtp = {
        ...input.services.smtp,
        pass: preserveSecret(input.services.smtp.pass, currentSmtp.pass as string | undefined),
      };
    }

    const capabilities = input.capabilities ?? currentCaps;

    await repoUpdateSystemConfig({
      services: mergedServices,
      capabilities,
    });

    invalidateCapabilityCache();
    log.info("Admin settings updated");

    return { success: true, message: "Settings saved" };
  } catch (error) {
    log.error("Failed to update admin settings", { error: String(error) });
    return { success: false, message: "Failed to save settings" };
  }
}

export interface ServiceInputCreateUser {
  name: string;
  email: string;
  username: string;
  password: string;
  emailVerified?: boolean;
}

export async function serviceCreateUser(
  input: ServiceInputCreateUser
): Promise<{ success: boolean; message: string; data?: AdminUserRow }> {
  try {
    const exists = await repoCheckUserExists(input.email, input.username);
    if (exists.email) return { success: false, message: "Email already exists" };
    if (exists.username) return { success: false, message: "Username already exists" };

    const passwordHash = await hashPassword(input.password);
    const user = await repoCreateUser({
      id: randomUUID(),
      accountId: randomUUID(),
      name: input.name,
      email: input.email,
      username: input.username,
      passwordHash,
      emailVerified: input.emailVerified ?? true,
    });
    return { success: true, message: "User created", data: user };
  } catch (error) {
    log.error("Failed to create user", { error: String(error) });
    return { success: false, message: "Failed to create user" };
  }
}

export async function serviceDeleteUser(
  userId: string
): Promise<{ success: boolean; message: string }> {
  try {
    if (process.env.NEXT_PUBLIC_AUTH_MODE === "single") {
      const username = await repoGetUserUsername(userId);
      if (username === "admin") {
        return {
          success: false,
          message: "Cannot delete the system admin user in single-user mode",
        };
      }
    }
    await repoDeleteUserCascade(userId);
    return { success: true, message: "User deleted" };
  } catch (error) {
    log.error("Failed to delete user", { userId, error: String(error) });
    return { success: false, message: "Failed to delete user" };
  }
}

export async function serviceSetUserEmailVerified(
  userId: string,
  verified: boolean
): Promise<{ success: boolean; message: string }> {
  try {
    await repoSetUserEmailVerified(userId, verified);
    return { success: true, message: verified ? "Email verified" : "Email unverified" };
  } catch (error) {
    log.error("Failed to update emailVerified", { userId, error: String(error) });
    return { success: false, message: "Failed to update" };
  }
}

export interface ServiceInputUpdateUser {
  userId: string;
  name: string;
  email: string;
  username: string;
  password?: string;
}

export async function serviceUpdateUser(
  input: ServiceInputUpdateUser
): Promise<{ success: boolean; message: string }> {
  try {
    if (process.env.NEXT_PUBLIC_AUTH_MODE === "single") {
      const currentUsername = await repoGetUserUsername(input.userId);
      if (currentUsername === "admin" && input.username !== "admin") {
        return {
          success: false,
          message: "Cannot change the system admin username in single-user mode",
        };
      }
    }
    const conflict = await repoCheckUserConflict(input.email, input.username, input.userId);
    if (conflict.email) return { success: false, message: "Email already in use" };
    if (conflict.username) return { success: false, message: "Username already in use" };

    await repoUpdateUser({
      userId: input.userId,
      name: input.name,
      email: input.email,
      username: input.username,
    });

    if (input.password && input.password.length >= 8) {
      const passwordHash = await hashPassword(input.password);
      await repoUpdateUserPassword(input.userId, passwordHash);
    }

    return { success: true, message: "User updated" };
  } catch (error) {
    log.error("Failed to update user", { userId: input.userId, error: String(error) });
    return { success: false, message: "Failed to update user" };
  }
}
