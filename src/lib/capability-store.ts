"use client";

import { create } from "zustand";
import type { DeploymentTier } from "../../generated/prisma/enums";

export interface CapabilityState {
  tier: DeploymentTier;
  capabilities: Record<string, boolean>;
  loaded: boolean;
  hydrate: (tier: DeploymentTier, capabilities: Record<string, boolean>) => void;
  updateAll: (tier: DeploymentTier, capabilities: Record<string, boolean>) => void;
  has: (name: string) => boolean;
}

export const useCapabilityStore = create<CapabilityState>()((set, get) => ({
  tier: "SINGLE" as DeploymentTier,
  capabilities: {},
  loaded: false,
  hydrate: (tier, capabilities) => set({ tier, capabilities, loaded: true }),
  updateAll: (tier, capabilities) => set({ tier, capabilities, loaded: true }),
  has: (name) => get().capabilities[name] ?? false,
}));
