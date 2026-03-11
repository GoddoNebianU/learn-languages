"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Languages } from "lucide-react";
import { cn } from "@/utils/cn";

const languages = [
  { code: "en-US", label: "English" },
  { code: "zh-CN", label: "中文" },
  { code: "ja-JP", label: "日本語" },
  { code: "ko-KR", label: "한국어" },
  { code: "de-DE", label: "Deutsch" },
  { code: "fr-FR", label: "Français" },
  { code: "it-IT", label: "Italiano" },
  { code: "ug-CN", label: "ئۇيغۇرچە" },
];

export function LanguageSettings() {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingLocale, setPendingLocale] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  useEffect(() => {
    if (pendingLocale) {
      document.cookie = `locale=${pendingLocale}; path=/`;
      window.location.reload();
    }
  }, [pendingLocale]);

  const setLocale = useCallback((locale: string) => {
    setPendingLocale(locale);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center p-2 rounded-md text-white hover:bg-white/10 transition-colors"
        aria-label="切换语言"
        aria-expanded={isOpen}
      >
        <Languages size={20} />
      </button>

      <div
        className={cn(
          "absolute right-0 top-full mt-2 w-40 rounded-lg bg-white shadow-lg ring-1 ring-black/5 overflow-hidden transition-all duration-200 origin-top-right z-50",
          isOpen
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none"
        )}
        role="menu"
      >
        <div className="py-1">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLocale(lang.code)}
              className="w-full flex items-center px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors text-left"
              role="menuitem"
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
