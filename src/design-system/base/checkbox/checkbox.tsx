"use client";

import React, { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/design-system/lib/utils";

/**
 * Checkbox 复选框组件
 *
 * Design System 中的复选框组件，支持多种状态和尺寸。
 *
 * @example
 * ```tsx
 * // 默认复选框
 * <Checkbox>同意条款</Checkbox>
 *
 * // 受控组件
 * <Checkbox checked={checked} onChange={handleChange}>
 *   同意条款
 * </Checkbox>
 *
 * // 错误状态
 * <Checkbox error>必选项</Checkbox>
 * ```
 */

/**
 * 复选框变体样式
 */
const checkboxVariants = cva(
  // 基础样式
  "peer h-4 w-4 shrink-0 rounded border-2 transition-all duration-250 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-gray-300 checked:bg-primary-500 checked:border-primary-500",
        success: "border-gray-300 checked:bg-success-500 checked:border-success-500",
        warning: "border-gray-300 checked:bg-warning-500 checked:border-warning-500",
        error: "border-gray-300 checked:bg-error-500 checked:border-error-500",
      },
      size: {
        sm: "h-3.5 w-3.5",
        md: "h-4 w-4",
        lg: "h-5 w-5",
      },
      error: {
        true: "border-error-500",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      error: false,
    },
  }
);

export type CheckboxVariant = VariantProps<typeof checkboxVariants>["variant"];
export type CheckboxSize = VariantProps<typeof checkboxVariants>["size"];

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof checkboxVariants> {
  // 标签文本
  label?: React.ReactNode;
  // 标签位置
  labelPosition?: "left" | "right";
  // 自定义复选框类名
  checkboxClassName?: string;
}

/**
 * Checkbox 复选框组件
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      variant = "default",
      size = "md",
      error = false,
      label,
      labelPosition = "right",
      className,
      checkboxClassName,
      disabled,
      ...props
    },
    ref
  ) => {
    const checkboxId = React.useId();

    const renderCheckbox = () => (
      <input
        ref={ref}
        type="checkbox"
        id={checkboxId}
        disabled={disabled}
        className={cn(
          checkboxVariants({ variant, size, error }),
          checkboxClassName
        )}
        {...props}
      />
    );

    const renderLabel = () => {
      if (!label) return null;

      return (
        <label
          htmlFor={checkboxId}
          className={cn(
            "text-base font-normal leading-none",
            disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
            labelPosition === "left" ? "mr-2" : "ml-2"
          )}
        >
          {label}
        </label>
      );
    };

    if (!label) {
      return renderCheckbox();
    }

    return (
      <div className={cn("inline-flex items-center", className)}>
        {labelPosition === "left" && renderLabel()}
        {renderCheckbox()}
        {labelPosition === "right" && renderLabel()}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

/**
 * CheckboxGroup - 复选框组
 */
export interface CheckboxGroupProps {
  children: React.ReactNode;
  label?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

export function CheckboxGroup({
  children,
  label,
  error,
  required,
  className,
}: CheckboxGroupProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <div className="text-base font-medium text-gray-900">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </div>
      )}
      <div className="space-y-2">{children}</div>
      {error && <p className="text-sm text-error-500">{error}</p>}
    </div>
  );
}
