"use client";

import { useCapabilityStore, type CapabilityState } from "@/lib/capability-store";

interface CapabilityHydratorProps {
  capabilities: Record<string, boolean>;
  children: React.ReactNode;
}

export function CapabilityHydrator({ capabilities, children }: CapabilityHydratorProps) {
  const hydrate = useCapabilityStore((s: CapabilityState) => s.hydrate);
  hydrate(capabilities);
  return <>{children}</>;
}
