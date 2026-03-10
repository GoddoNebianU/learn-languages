"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  THEME_PRESETS,
  DEFAULT_THEME,
  getThemePreset,
  applyThemeColors,
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

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<string>(DEFAULT_THEME);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    if (savedTheme && getThemePreset(savedTheme)) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const preset = getThemePreset(currentTheme);
    if (preset) {
      applyThemeColors(preset);
      localStorage.setItem(STORAGE_KEY, currentTheme);
    }
  }, [currentTheme, mounted]);

  const setTheme = (themeId: string) => {
    if (getThemePreset(themeId)) {
      setCurrentTheme(themeId);
    }
  };

  const themePreset = getThemePreset(currentTheme) || THEME_PRESETS[0];

  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        themePreset,
        setTheme,
        availableThemes: THEME_PRESETS,
      }}
    >
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
