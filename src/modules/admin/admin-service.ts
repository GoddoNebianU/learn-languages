import { createLogger } from "@/lib/logger";
import { invalidateCapabilityCache, normalizeTier } from "@/lib/capability";
import {
  repoGetSystemConfig,
  repoGetTierCapability,
  repoGetAllTierCapabilities,
  repoUpdateSystemConfig,
  repoUpdateSettingsAtomic,
  repoCreateTierCapability,
  repoDeleteTierCapability,
} from "./admin-repository";

const log = createLogger("admin-service");

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
  tier?: string;
  capabilities?: {
    signup: boolean;
    userProfile: boolean;
    social: boolean;
    email: boolean;
  };
  services?: {
    llm?: { apiKey: string; apiUrl: string; modelName: string };
    tts?: { apiKey: string };
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

export interface ServiceInputAddTier {
  name: string;
}

export interface ServiceInputDeleteTier {
  tier: string;
}

export interface AdminSettingsData {
  tier: string;
  allTiers: Array<{
    tier: string;
    capabilities: {
      signup: boolean;
      userProfile: boolean;
      social: boolean;
      email: boolean;
    };
  }>;
  capabilities: {
    signup: boolean;
    userProfile: boolean;
    social: boolean;
    email: boolean;
  };
  services: {
    llm: {
      apiKey: string;
      apiUrl: string;
      modelName: string;
    };
    tts: {
      apiKey: string;
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
      await repoUpdateSystemConfig({ tier: "SINGLE", services: {} });
      config = await repoGetSystemConfig();
      if (!config) {
        return { success: false, message: "Failed to initialize system config" };
      }
      log.info("Auto-created default SystemConfig");
    }

    const tier = config.tier;
    const tierRow = await repoGetTierCapability(tier);
    const allTiers = await repoGetAllTierCapabilities();
    const services = (config.services ?? {}) as Record<string, unknown>;

    const llm = (services.llm ?? {}) as Record<string, string>;
    const tts = (services.tts ?? {}) as Record<string, string>;
    const smtp = (services.smtp ?? {}) as Record<string, unknown>;

    return {
      success: true,
      message: "Settings loaded",
      data: {
        tier,
        allTiers: allTiers.map((t) => ({
          tier: t.tier,
          capabilities: {
            signup: t.signup,
            userProfile: t.userProfile,
            social: t.social,
            email: t.email,
          },
        })),
        capabilities: {
          signup: tierRow?.signup ?? true,
          userProfile: tierRow?.userProfile ?? true,
          social: tierRow?.social ?? true,
          email: tierRow?.email ?? true,
        },
        services: {
          llm: {
            apiKey: maskSecret(llm.apiKey),
            apiUrl: llm.apiUrl ?? "",
            modelName: llm.modelName ?? "",
          },
          tts: { apiKey: maskSecret(tts.apiKey) },
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
    const currentTier = normalizeTier(config?.tier ?? "SINGLE");

    const newTier = normalizeTier(input.tier ?? currentTier);

    if (newTier !== currentTier) {
      const targetTier = await repoGetTierCapability(newTier);
      if (!targetTier) {
        return { success: false, message: `Tier "${newTier}" does not exist. Add it first.` };
      }
    }

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
      };
    }
    if (input.services?.smtp) {
      mergedServices.smtp = {
        ...input.services.smtp,
        pass: preserveSecret(input.services.smtp.pass, currentSmtp.pass as string | undefined),
      };
    }

    await repoUpdateSettingsAtomic({
      tier: newTier,
      services: mergedServices,
      capabilities: input.capabilities,
    });

    invalidateCapabilityCache();
    log.info("Admin settings updated", { tier: newTier });

    return { success: true, message: "Settings saved" };
  } catch (error) {
    log.error("Failed to update admin settings", { error: String(error) });
    return { success: false, message: "Failed to save settings" };
  }
}

export async function serviceAddTier(
  input: ServiceInputAddTier
): Promise<{ success: boolean; message: string }> {
  const name = normalizeTier(input.name);

  try {
    const existing = await repoGetTierCapability(name);
    if (existing) {
      return { success: false, message: "Tier already exists" };
    }

    await repoCreateTierCapability({
      tier: name,
      signup: true,
      userProfile: true,
      social: true,
      email: true,
    });

    log.info("Tier added", { tier: name });
    return { success: true, message: `Tier "${name}" added` };
  } catch (error) {
    log.error("Failed to add tier", { error: String(error) });
    return { success: false, message: "Failed to add tier" };
  }
}

export async function serviceDeleteTier(
  input: ServiceInputDeleteTier
): Promise<{ success: boolean; message: string }> {
  const tier = normalizeTier(input.tier);

  try {
    const config = await repoGetSystemConfig();
    if (normalizeTier(config?.tier ?? "") === tier) {
      return { success: false, message: "Cannot delete the active tier" };
    }

    const deletedCount = await repoDeleteTierCapability(tier);
    if (deletedCount === 0) {
      return { success: false, message: "Tier not found" };
    }

    log.info("Tier deleted", { tier });
    return { success: true, message: `Tier "${tier}" deleted` };
  } catch (error) {
    log.error("Failed to delete tier", { error: String(error) });
    return { success: false, message: "Failed to delete tier" };
  }
}
