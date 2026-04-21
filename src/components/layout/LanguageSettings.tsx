"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Languages } from "lucide-react";
import { cn } from "@/utils/cn";
import { Button, GhostLightButton } from "@/design-system/base/button";

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
  const previousActiveElement = useRef<Element | null>(null);

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
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
      const firstItem = menuRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]');
      firstItem?.focus();
    } else if (previousActiveElement.current instanceof HTMLElement) {
      previousActiveElement.current.focus();
      previousActiveElement.current = null;
    }
  }, [isOpen]);

  useEffect(() => {
    if (pendingLocale) {
      document.cookie = `locale=${pendingLocale}; path=/; max-age=31536000; SameSite=Lax${window.location.protocol === "https:" ? "; Secure" : ""}`;
      window.location.reload();
    }
  }, [pendingLocale]);

  const setLocale = useCallback((locale: string) => {
    setPendingLocale(locale);
  }, []);

  const handleMenuKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      const items = menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]');
      if (!items) return;

      const currentIndex = Array.from(items).indexOf(e.currentTarget);

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        items[nextIndex]?.focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        items[prevIndex]?.focus();
      } else if (e.key === "Escape") {
        e.preventDefault();
        setIsOpen(false);
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.currentTarget.click();
      }
    },
    []
  );

  return (
    <div className="relative" ref={menuRef}>
      <GhostLightButton
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === "Escape" && isOpen) {
            e.preventDefault();
            setIsOpen(false);
          }
        }}
        className="h-auto p-2"
        aria-label="切换语言"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <Languages size={20} />
      </GhostLightButton>

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
            <Button
              key={lang.code}
              variant="ghost"
              onClick={() => setLocale(lang.code)}
              onKeyDown={handleMenuKeyDown}
              tabIndex={isOpen ? 0 : -1}
              className="h-auto w-full justify-start px-4 py-2.5 text-left"
              role="menuitem"
            >
              {lang.label}
            </Button>
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
