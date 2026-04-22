"use client";

import React, { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";

/**
 * Select 下拉选择框组件
 *
 * Design System 中的下拉选择框组件。
 *
 * @example
 * ```tsx
 * <Select>
 *   <option value="">请选择</option>
 *   <option value="1">选项 1</option>
 *   <option value="2">选项 2</option>
 * </Select>
 * ```
 */

/**
 * Select 变体样式
 */
const selectVariants = cva(
  // 基础样式
  "flex w-full appearance-none items-center justify-between rounded-md border px-3 py-2 pr-8 text-base transition-all duration-250 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-b-2 border-gray-300 bg-transparent rounded-t-md",
        bordered: "border-gray-300 bg-white",
        filled: "border-transparent bg-gray-100",
        light: "border-transparent bg-gray-100 shadow-sm hover:bg-gray-200 font-semibold cursor-pointer",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-10 px-4 text-base",
        lg: "h-12 px-5 text-lg",
      },
      error: {
        true: "border-error-500 focus-visible:ring-error-500",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "filled",
        error: true,
        className: "bg-error-50",
      },
      {
        variant: "light",
        error: true,
        className: "bg-error-50 hover:bg-error-100",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "md",
      error: false,
    },
  }
);

export type SelectVariant = VariantProps<typeof selectVariants>["variant"];
export type SelectSize = VariantProps<typeof selectVariants>["size"];

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size">,
    VariantProps<typeof selectVariants> {}

/**
 * Select 下拉选择框组件
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      variant = "default",
      size = "md",
      error = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(selectVariants({ variant, size, error }), className)}
          aria-invalid={error ? "true" : undefined}
          {...props}
        >
          {children}
        </select>
        {/* 下拉箭头图标 */}
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    );
  }
);

Select.displayName = "Select";
