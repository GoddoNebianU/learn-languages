"use client";

import React, { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";
import { focusRing, disabledStyles, transition } from "./_shared";

/**
 * Textarea 多行文本输入组件
 *
 * Design System 中的多行文本输入组件，支持多种样式变体。
 *
 * @example
 * ```tsx
 * // 默认样式
 * <Textarea placeholder="请输入内容" rows={4} />
 *
 * // 带边框样式
 * <Textarea variant="bordered" placeholder="带边框的文本域" />
 *
 * // 填充样式
 * <Textarea variant="filled" placeholder="填充背景的文本域" />
 * ```
 */

/**
 * Textarea 变体样式
 */
const textareaVariants = cva(
  // 基础样式
  cn(
    "flex w-full rounded-md border px-3 py-2 text-base placeholder:text-gray-400 resize-none",
    transition,
    focusRing,
    disabledStyles
  ),
  {
    variants: {
      variant: {
        default: "border-b-2 border-gray-300 bg-transparent rounded-t-md",
        bordered: "border-gray-300 bg-white",
        filled: "border-transparent bg-gray-100",
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
    ],
    defaultVariants: {
      variant: "default",
      size: "md",
      error: false,
    },
  }
);

export type TextareaVariant = VariantProps<typeof textareaVariants>["variant"];
export type TextareaSize = VariantProps<typeof textareaVariants>["size"];

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>, VariantProps<typeof textareaVariants> {
  // 自动调整高度
  autoResize?: boolean;
  containerClassName?: string;
}

/**
 * Textarea 多行文本输入组件
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      variant = "default",
      size = "md",
      error = false,
      className,
      containerClassName,
      autoResize = false,
      onChange,
      rows = 3,
      ...props
    },
    ref
  ) => {
    // 自动调整高度的 change 处理
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (autoResize) {
        const target = e.target;
        target.style.height = "auto";
        target.style.height = `${target.scrollHeight}px`;
      }
      onChange?.(e);
    };

    const textareaEl = (
      <textarea
        ref={ref}
        rows={rows}
        className={cn(textareaVariants({ variant, size, error }), className)}
        onChange={handleChange}
        aria-invalid={error ? "true" : undefined}
        {...props}
      />
    );

    return containerClassName ? (
      <div className={cn("relative", containerClassName)}>{textareaEl}</div>
    ) : (
      textareaEl
    );
  }
);

Textarea.displayName = "Textarea";
