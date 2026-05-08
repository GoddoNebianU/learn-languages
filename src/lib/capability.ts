import { prisma } from "./db";
import type { DeploymentTier } from "../../generated/prisma/enums";

export type { DeploymentTier };

let _capabilitiesCache: Map<string, boolean> | null = null;
let _tierCache: DeploymentTier | null = null;
let _servicesCache: Record<string, unknown> | null = null;

async function loadCapabilities(): Promise<{ capabilities: Map<string, boolean>; tier: DeploymentTier; services: Record<string, unknown> }> {
  if (_capabilitiesCache && _tierCache && _servicesCache) {
    return { capabilities: _capabilitiesCache, tier: _tierCache, services: _servicesCache };
  }

  const [config, tierRows] = await Promise.all([
    prisma.systemConfig.findUnique({ where: { id: 1 } }),
    prisma.tierCapability.findMany(),
  ]);

  const tier = config?.tier ?? "SINGLE";
  const services = (config?.services ?? {}) as Record<string, unknown>;

  const capabilities = new Map<string, boolean>();
  for (const row of tierRows) {
    if (row.tier === tier) {
      capabilities.set(row.capability, row.enabled);
    }
  }

  _capabilitiesCache = capabilities;
  _tierCache = tier;
  _servicesCache = services;

  return { capabilities, tier, services };
}

export function invalidateCapabilityCache() {
  _capabilitiesCache = null;
  _tierCache = null;
  _servicesCache = null;
}

export async function getTier(): Promise<DeploymentTier> {
  const { tier } = await loadCapabilities();
  return tier;
}

export async function getCapabilities(): Promise<Record<string, boolean>> {
  const { capabilities } = await loadCapabilities();
  const result: Record<string, boolean> = {};
  for (const [key, value] of capabilities) {
    result[key] = value;
  }
  return result;
}

export async function hasCapability(name: string): Promise<boolean> {
  const { capabilities } = await loadCapabilities();
  return capabilities.get(name) ?? false;
}

export async function getServices(): Promise<Record<string, unknown>> {
  const { services } = await loadCapabilities();
  return services;
}

export function getLlmConfig(services: Record<string, unknown>) {
  const llm = (services.llm ?? {}) as Record<string, string>;
  return {
    apiKey: llm.apiKey ?? "",
    apiUrl: llm.apiUrl ?? "https://api.deepseek.com/chat/completions",
    modelName: llm.modelName ?? "deepseek-v3",
  };
}

export function getTtsConfig(services: Record<string, unknown>) {
  const tts = (services.tts ?? {}) as Record<string, string>;
  return { apiKey: tts.apiKey ?? "" };
}

export function getSmtpConfig(services: Record<string, unknown>) {
  const smtp = (services.smtp ?? {}) as Record<string, unknown>;
  return {
    host: (smtp.host as string) ?? "",
    port: (smtp.port as number) ?? 587,
    secure: (smtp.secure as boolean) ?? false,
    user: (smtp.user as string) ?? "",
    pass: (smtp.pass as string) ?? "",
    from: (smtp.from as string) ?? "",
  };
}
