"use client";

import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";
import { focusRing, disabledStyles } from "./_shared";

/**
 * Switch — 开关切换组件。
 *
 * 替代原生 `<input type="checkbox">`, 提供一致的视觉和无障碍语义。
 * `role="switch"` + `aria-checked` + 键盘可达。
 *
 * @example
 * ```tsx
 * <Switch checked={enabled} onCheckedChange={setEnabled} />
 * ```
 */
export interface SwitchProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "type"> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, onCheckedChange, disabled, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onCheckedChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full",
          "transition-colors",
          focusRing,
          disabledStyles,
          checked ? "bg-primary-500" : "bg-gray-300",
          className
        )}
        {...props}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-6" : "translate-x-1"
          )}
        />
      </button>
    );
  }
);

Switch.displayName = "Switch";
