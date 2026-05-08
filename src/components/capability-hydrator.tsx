"use client";

import { useCapabilityStore, type CapabilityState } from "@/lib/capability-store";
import type { DeploymentTier } from "../../generated/prisma/enums";

interface CapabilityHydratorProps {
  tier: DeploymentTier;
  capabilities: Record<string, boolean>;
  children: React.ReactNode;
}

export function CapabilityHydrator({ tier, capabilities, children }: CapabilityHydratorProps) {
  const hydrate = useCapabilityStore((s: CapabilityState) => s.hydrate);
  hydrate(tier, capabilities);
  return <>{children}</>;
}
