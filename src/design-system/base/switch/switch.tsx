"use client";

import React, { forwardRef, useState } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/design-system/lib/utils";

/**
 * Switch 开关组件
 *
 * Design System 中的开关组件，用于二进制状态切换。
 *
 * @example
 * ```tsx
 * // 默认开关
 * <Switch checked={checked} onChange={setChecked} />
 *
 * // 带标签
 * <Switch label="启用通知" checked={checked} onChange={setChecked} />
 *
 * // 不同尺寸
 * <Switch size="sm" checked={checked} onChange={setChecked} />
 * <Switch size="lg" checked={checked} onChange={setChecked} />
 * ```
 */

/**
 * 开关变体样式
 */
const switchVariants = cva(
  // 基础样式
  "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 transition-all duration-250 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
  {
    variants: {
      variant: {
        default:
          "border-gray-300 bg-gray-100 checked:border-primary-500 checked:bg-primary-500",
        success:
          "border-gray-300 bg-gray-100 checked:border-success-500 checked:bg-success-500",
        warning:
          "border-gray-300 bg-gray-100 checked:border-warning-500 checked:bg-warning-500",
        error:
          "border-gray-300 bg-gray-100 checked:border-error-500 checked:bg-error-500",
      },
      size: {
        sm: "h-5 w-9",
        md: "h-6 w-11",
        lg: "h-7 w-13",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export type SwitchVariant = VariantProps<typeof switchVariants>["variant"];
export type SwitchSize = VariantProps<typeof switchVariants>["size"];

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof switchVariants> {
  // 标签文本
  label?: React.ReactNode;
  // 标签位置
  labelPosition?: "left" | "right";
  // 自定义开关类名
  switchClassName?: string;
}

/**
 * Switch 开关组件
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      variant = "default",
      size = "md",
      label,
      labelPosition = "right",
      className,
      switchClassName,
      disabled,
      checked,
      defaultChecked,
      onChange,
      ...props
    },
    ref
  ) => {
    const switchId = React.useId();
    const [internalChecked, setInternalChecked] = useState(
      checked ?? defaultChecked ?? false
    );

    // 处理受控和非受控模式
    const isControlled = checked !== undefined;
    const isChecked = isControlled ? checked : internalChecked;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setInternalChecked(e.target.checked);
      }
      onChange?.(e);
    };

    // 确保 size 有默认值
    const actualSize = size ?? "md";

    // 滑块大小
    const thumbSize = {
      sm: "h-3.5 w-3.5",
      md: "h-4 w-4",
      lg: "h-5 w-5",
    }[actualSize];

    // 滑块位移
    const thumbTranslate = {
      sm: isChecked ? "translate-x-4" : "translate-x-0.5",
      md: isChecked ? "translate-x-5" : "translate-x-0.5",
      lg: isChecked ? "translate-x-6" : "translate-x-0.5",
    }[actualSize];

    const renderSwitch = () => (
      <div className="relative inline-block">
        <input
          ref={ref}
          type="checkbox"
          id={switchId}
          disabled={disabled}
          checked={isChecked}
          onChange={handleChange}
          className={cn(
            switchVariants({ variant, size }),
            "peer/switch",
            switchClassName
          )}
          {...props}
        />
        {/* 滑块 */}
        <div
          className={cn(
            "pointer-events-none absolute top-1/2 -translate-y-1/2 rounded-full bg-white shadow-sm transition-transform duration-250",
            thumbSize,
            thumbTranslate
          )}
        />
      </div>
    );

    const renderLabel = () => {
      if (!label) return null;

      return (
        <label
          htmlFor={switchId}
          className={cn(
            "text-base font-normal leading-none",
            disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
            labelPosition === "left" ? "mr-3" : "ml-3"
          )}
        >
          {label}
        </label>
      );
    };

    if (!label) {
      return renderSwitch();
    }

    return (
      <div className={cn("inline-flex items-center", className)}>
        {labelPosition === "left" && renderLabel()}
        {renderSwitch()}
        {labelPosition === "right" && renderLabel()}
      </div>
    );
  }
);

Switch.displayName = "Switch";
