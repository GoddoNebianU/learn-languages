"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/utils/cn";
import type { NavigationItem } from "./Navbar";

// Module-level counter to prevent body overflow conflicts with other overlays (e.g. Modal)
let overflowLockCount = 0;

function lockBodyScroll() {
  overflowLockCount++;
  document.body.style.overflow = "hidden";
}

function unlockBodyScroll() {
  overflowLockCount--;
  if (overflowLockCount <= 0) {
    overflowLockCount = 0;
    document.body.style.overflow = "";
  }
}

interface MobileMenuProps {
  items: NavigationItem[];
}

function getMenuItems(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>('[role="menuitem"]'));
}

export function MobileMenu({ items }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const triggerWrapperRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      const button = triggerWrapperRef.current?.querySelector("button");
      button?.focus();
      return;
    }

    lockBodyScroll();

    requestAnimationFrame(() => {
      const menuItems = menuPanelRef.current ? getMenuItems(menuPanelRef.current) : [];
      menuItems[0]?.focus();
    });

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const panel = menuPanelRef.current;
      if (!panel) return;

      const menuItems = getMenuItems(panel);
      if (menuItems.length === 0) return;

      const currentIndex = menuItems.indexOf(document.activeElement as HTMLElement);

      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          const nextIndex = currentIndex < menuItems.length - 1 ? currentIndex + 1 : 0;
          menuItems[nextIndex]?.focus();
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : menuItems.length - 1;
          menuItems[prevIndex]?.focus();
          break;
        }
        case "Escape": {
          closeMenu();
          break;
        }
        case "Enter":
        case " ": {
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.click();
          }
          break;
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      unlockBodyScroll();
    };
  }, [isOpen, closeMenu]);

  return (
    <div className="relative" ref={menuRef}>
      <div ref={triggerWrapperRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center justify-center rounded-md p-2 text-white transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
          aria-label={isOpen ? "关闭菜单" : "打开菜单"}
          aria-expanded={isOpen}
          aria-haspopup="menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div
        ref={menuPanelRef}
        className={cn(
          "absolute top-full right-0 z-50 mt-2 w-56 origin-top-right overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black/5 transition-all duration-200",
          isOpen ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
        )}
        role="menu"
        aria-hidden={!isOpen}
      >
        <div className="py-1">
          {items.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900 focus:bg-gray-50 focus:text-gray-900 focus:outline-none"
              role="menuitem"
              tabIndex={isOpen ? 0 : -1}
              onClick={closeMenu}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
            >
              {item.icon && <span className="shrink-0 text-gray-500">{item.icon}</span>}
              <span>{item.label}</span>
            </a>
          ))}
        </div>
      </div>

      {isOpen && <div className="fixed inset-0 z-40" onClick={closeMenu} aria-hidden="true" />}
    </div>
  );
}
