"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/utils/cn";
import type { NavigationItem } from "./Navbar";

interface MobileMenuProps {
  items: NavigationItem[];
}

export function MobileMenu({ items }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "";
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

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center p-2 rounded-md text-white hover:bg-white/10 transition-colors"
        aria-label={isOpen ? "关闭菜单" : "打开菜单"}
        aria-expanded={isOpen}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div
        className={cn(
          "absolute right-0 top-full mt-2 w-56 rounded-lg bg-white shadow-lg ring-1 ring-black/5 overflow-hidden transition-all duration-200 origin-top-right z-50",
          isOpen
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none"
        )}
        role="menu"
      >
        <div className="py-1">
          {items.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
            >
              {item.icon && <span className="shrink-0 text-gray-500">{item.icon}</span>}
              <span>{item.label}</span>
            </a>
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
