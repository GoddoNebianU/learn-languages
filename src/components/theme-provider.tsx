"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  THEME_PRESETS,
  DEFAULT_THEME,
  getThemePreset,
  type ThemePreset,
} from "@/shared/theme-presets";

type ThemeContextType = {
  currentTheme: string;
  themePreset: ThemePreset;
  setTheme: (themeId: string) => void;
  availableThemes: ThemePreset[];
};

const ThemeContext = createContext<ThemeContextType | null>(null);

const STORAGE_KEY = "theme-preset";

function getInitialTheme(): string {
  if (typeof window === "undefined") return DEFAULT_THEME;
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved && getThemePreset(saved) ? saved : DEFAULT_THEME;
}

function applyThemeColors(preset: ThemePreset): void {
  const root = document.documentElement;
  Object.entries(preset.colors).forEach(([shade, color]) => {
    root.style.setProperty(`--color-primary-${shade}`, color);
  });
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<string>(DEFAULT_THEME);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const savedTheme = getInitialTheme();
    if (savedTheme !== currentTheme) {
      setCurrentTheme(savedTheme);
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const preset = getThemePreset(currentTheme);
    if (preset) {
      applyThemeColors(preset);
      localStorage.setItem(STORAGE_KEY, currentTheme);
    }
  }, [currentTheme, hydrated]);

  const setTheme = useCallback((themeId: string) => {
    if (getThemePreset(themeId)) {
      setCurrentTheme(themeId);
    }
  }, []);

  const themePreset = useMemo(() => getThemePreset(currentTheme) || THEME_PRESETS[0], [currentTheme]);

  const value = useMemo(() => ({
    currentTheme,
    themePreset,
    setTheme,
    availableThemes: THEME_PRESETS,
  }), [currentTheme, themePreset, setTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
