"use client";

import { create } from "zustand";

export interface CapabilityState {
  capabilities: Record<string, boolean>;
  loaded: boolean;
  hydrate: (capabilities: Record<string, boolean>) => void;
  updateAll: (capabilities: Record<string, boolean>) => void;
  has: (name: string) => boolean;
}

export const useCapabilityStore = create<CapabilityState>()((set, get) => ({
  capabilities: {},
  loaded: false,
  hydrate: (capabilities) => set({ capabilities, loaded: true }),
  updateAll: (capabilities) => set({ capabilities, loaded: true }),
  has: (name) => get().capabilities[name] ?? false,
}));
