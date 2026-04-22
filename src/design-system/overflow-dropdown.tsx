"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";

/**
 * OverflowDropdown 组件属性
 */
export interface OverflowDropdownProps<T> {
  /** 项目数组 */
  items: T[];
  /** 可见项目数量 */
  visibleCount: number;
  /** 渲染项目函数 */
  renderItem: (item: T) => React.ReactNode;
  /** 项目点击处理函数 */
  onItemClick: (item: T) => void;
  /** 获取项目唯一键函数 */
  getKey: (item: T) => string | number;
  /** 标签文本 */
  label?: string;
  /** 自定义类名 */
  className?: string;
}

/**
 * OverflowDropdown 组件
 * 
 * 显示隐藏项目的下拉菜单组件，当项目数量超过可见数量时显示 "+N" 按钮
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const [selected, setSelected] = useState<string | null>(null);
 *   const items = ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"];
 *   
 *   return (
 *     <OverflowDropdown
 *       items={items}
 *       visibleCount={3}
 *       getKey={(item) => item}
 *       renderItem={(item) => <div>{item}</div>}
 *       onItemClick={(item) => setSelected(item)}
 *       label="更多选项"
 *     />
 *   );
 * }
 * ```
 */
export function OverflowDropdown<T>({
  items,
  visibleCount,
  renderItem,
  onItemClick,
  getKey,
  label = "+N",
  className,
}: OverflowDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const hiddenCount = items.length - visibleCount;

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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
      // 延迟一帧等待 DOM 渲染
      requestAnimationFrame(() => {
        const firstItem = menuRef.current?.querySelector('[role="menuitem"]');
        (firstItem as HTMLElement | null)?.focus();
      });
    }
  }, [isOpen]);

  const toggleDropdown = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleItemClick = useCallback(
    (item: T) => {
      onItemClick(item);
      setIsOpen(false);
    },
    [onItemClick]
  );

  const handleMenuKeyDown = useCallback((e: React.KeyboardEvent) => {
    const menuItems = menuRef.current?.querySelectorAll('[role="menuitem"]');
    if (!menuItems || !menuItems.length) return;

    const currentIndex = Array.from(menuItems).indexOf(document.activeElement as Element);

    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        const nextIndex = currentIndex < menuItems.length - 1 ? currentIndex + 1 : 0;
        (menuItems[nextIndex] as HTMLElement).focus();
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : menuItems.length - 1;
        (menuItems[prevIndex] as HTMLElement).focus();
        break;
      }
      case "Home": {
        e.preventDefault();
        (menuItems[0] as HTMLElement).focus();
        break;
      }
      case "End": {
        e.preventDefault();
        (menuItems[menuItems.length - 1] as HTMLElement).focus();
        break;
      }
      case "Escape": {
        setIsOpen(false);
        triggerRef.current?.focus();
        break;
      }
    }
  }, []);

  if (items.length <= visibleCount) {
    return <div className={cn("flex", className)}>{items.map(renderItem)}</div>;
  }

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <button
        ref={triggerRef}
        onClick={toggleDropdown}
        className="flex items-center justify-center px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        aria-label="显示更多选项"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <span className="mr-1">{label}</span>
        <span className="font-medium">{hiddenCount}</span>
        <ChevronDown className="ml-1 h-4 w-4" />
      </button>

      <div
        ref={menuRef}
        className={cn(
          "absolute z-50 mt-1.5 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[100px] transition-all duration-200",
          isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        )}
        role="menu"
        onKeyDown={handleMenuKeyDown}
      >
<div className="py-1">
          {items.slice(visibleCount).map((item) => (
            <div
              key={getKey(item)}
              onClick={() => handleItemClick(item)}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer"
              role="menuitem"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleItemClick(item);
                }
              }}
            >
              {renderItem(item)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}