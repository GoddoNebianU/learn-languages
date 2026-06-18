import { prisma } from "./db";

const CAPABILITY_KEYS = ["signup", "userProfile", "social", "email"] as const;
export type CapabilityKey = (typeof CAPABILITY_KEYS)[number];

// --- Defaults (must match schema @default values) ---
const DEFAULT_CAPABILITIES: Record<string, boolean> = {
  signup: true,
  userProfile: true,
  social: true,
  email: true,
};

// --- Cache with TTL + single-flight ---
const CACHE_TTL_MS = 60_000; // 60 seconds

interface CachedState {
  capabilities: Map<string, boolean>;
  services: Record<string, unknown>;
  cachedAt: number;
}

let _cache: CachedState | null = null;
let _loadPromise: Promise<CachedState> | null = null;

function isCacheValid(): boolean {
  return _cache !== null && Date.now() - _cache.cachedAt < CACHE_TTL_MS;
}

async function doLoad(): Promise<CachedState> {
  const config = await prisma.systemConfig.findUnique({ where: { id: 1 } });

  const services = (config?.services ?? {}) as Record<string, unknown>;

  const capabilities = new Map<string, boolean>();
  for (const key of CAPABILITY_KEYS) {
    // If config row exists use its values; otherwise use defaults (matching schema @default)
    capabilities.set(key, config ? config[key] : DEFAULT_CAPABILITIES[key]);
  }

  return { capabilities, services, cachedAt: Date.now() };
}

async function loadCapabilities(): Promise<CachedState> {
  if (isCacheValid() && _cache) return _cache;
  // Single-flight: concurrent callers share the same in-flight load
  if (_loadPromise) return _loadPromise;
  _loadPromise = doLoad();
  try {
    _cache = await _loadPromise;
    return _cache;
  } finally {
    _loadPromise = null;
  }
}

export function invalidateCapabilityCache(): void {
  _cache = null;
}

// --- Public API ---

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

// --- Service config accessors (no hardcoded vendor defaults) ---

export function getLlmConfig(services: Record<string, unknown>) {
  const llm = (services.llm ?? {}) as Record<string, unknown>;
  return {
    apiKey: (llm.apiKey as string) ?? "",
    apiUrl: (llm.apiUrl as string) ?? "",
    modelName: (llm.modelName as string) ?? "",
  };
}

export function getTtsConfig(services: Record<string, unknown>) {
  const tts = (services.tts ?? {}) as Record<string, unknown>;
  return {
    apiKey: (tts.apiKey as string) ?? "",
    primaryUrl: (tts.primaryUrl as string) ?? "",
    primaryUsername: (tts.primaryUsername as string) ?? "",
    primaryPassword: (tts.primaryPassword as string) ?? "",
  };
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
