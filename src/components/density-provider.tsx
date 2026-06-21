"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Density = "comfortable" | "compact";

type DensityContextType = {
  density: Density;
  setDensity: (density: Density) => void;
};

const DensityContext = createContext<DensityContextType | null>(null);

const STORAGE_KEY = "density-mode";
const DEFAULT_DENSITY: Density = "compact";

function getInitialDensity(): Density {
  if (typeof window === "undefined") return DEFAULT_DENSITY;
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved === "compact" || saved === "comfortable" ? saved : DEFAULT_DENSITY;
}

function applyDensity(density: Density): void {
  const root = document.documentElement;
  if (density === "compact") {
    root.dataset.density = "compact";
  } else {
    delete root.dataset.density;
  }
}

export function DensityProvider({ children }: { children: React.ReactNode }) {
  const [density, setDensityState] = useState<Density>(DEFAULT_DENSITY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const savedDensity = getInitialDensity();
    if (savedDensity !== density) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDensityState(savedDensity);
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    applyDensity(density);
    localStorage.setItem(STORAGE_KEY, density);
  }, [density, hydrated]);

  const setDensity = (newDensity: Density) => {
    setDensityState(newDensity);
  };

  return (
    <DensityContext.Provider value={{ density, setDensity }}>
      {children}
    </DensityContext.Provider>
  );
}

export function useDensity() {
  const context = useContext(DensityContext);
  if (!context) {
    throw new Error("useDensity must be used within a DensityProvider");
  }
  return context;
}
