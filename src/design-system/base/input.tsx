"use client";

import React, { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";

/**
 * Input 输入框组件
 *
 * Design System 中的输入框组件，支持多种样式变体和尺寸。
 * 完全可访问，支持焦点状态和错误状态。
 *
 * @example
 * ```tsx
 * // 默认样式
 * <Input placeholder="请输入内容" />
 *
 * // 带边框样式
 * <Input variant="bordered" placeholder="带边框的输入框" />
 *
 * // 填充样式
 * <Input variant="filled" placeholder="填充背景的输入框" />
 *
 * // 错误状态
 * <Input variant="bordered" error placeholder="有错误的输入框" />
 *
 * // 禁用状态
 * <Input disabled placeholder="禁用的输入框" />
 * ```
 */

/**
 * 输入框变体样式
 */
const inputVariants = cva(
  // 基础样式
  "flex w-full rounded-md border px-3 py-2 text-base transition-all duration-250 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-b-2 border-gray-300 bg-transparent rounded-t-md",
        bordered: "border-gray-300 bg-white",
        filled: "border-transparent bg-gray-100",
        search: "border-gray-200 bg-white pl-10 rounded-full",
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
      // 填充变体的错误状态
      {
        variant: "filled",
        error: true,
        className: "bg-error-50",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "md",
      error: false,
    },
  }
);

export type InputVariant = VariantProps<typeof inputVariants>["variant"];
export type InputSize = VariantProps<typeof inputVariants>["size"];

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  // 左侧图标（通常用于搜索框）
  leftIcon?: React.ReactNode;
  // 右侧图标（例如清除按钮）
  rightIcon?: React.ReactNode;
  // 容器类名（用于包裹图标和输入框）
  containerClassName?: string;
}

/**
 * Input 输入框组件
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = "default",
      size = "md",
      error = false,
      className,
      containerClassName,
      leftIcon,
      rightIcon,
      type = "text",
      ...props
    },
    ref
  ) => {
    // 如果有左侧图标，使用相对定位的容器
    if (leftIcon) {
      return (
        <div className={cn("relative", containerClassName)}>
          {/* 左侧图标 */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" aria-hidden="true">
            {leftIcon}
          </div>
          {/* 输入框 */}
          <input
            ref={ref}
            type={type}
            className={cn(
              inputVariants({ variant, size, error }),
              leftIcon && "pl-10"
            )}
            aria-invalid={error ? "true" : undefined}
            {...props}
          />
          {/* 右侧图标 */}
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
              {rightIcon}
            </div>
          )}
        </div>
      );
    }

    // 普通输入框
    return (
      <div className={cn("relative", containerClassName)}>
        <input
          ref={ref}
          type={type}
          className={cn(inputVariants({ variant, size, error }), className)}
          aria-invalid={error ? "true" : undefined}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
