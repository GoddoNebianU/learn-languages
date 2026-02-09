"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/design-system/lib/utils";

/**
 * Divider 分隔线组件
 *
 * Design System 中的分隔线组件，用于分隔内容区域。
 *
 * @example
 * ```tsx
 * // 水平分隔线
 * <Divider />
 *
 * // 带文字的分隔线
 * <Divider>或者</Divider>
 *
 * // 垂直分隔线
 * <Divider orientation="vertical" />
 *
 * // 不同样式
 * <Divider variant="dashed" />
 * <Divider variant="dotted" />
 * ```
 */

/**
 * Divider 变体样式
 */
const dividerVariants = cva(
  // 基础样式
  "border-gray-300",
  {
    variants: {
      variant: {
        solid: "border-solid",
        dashed: "border-dashed",
        dotted: "border-dotted",
      },
      orientation: {
        horizontal: "w-full border-t",
        vertical: "h-full border-l",
      },
    },
    defaultVariants: {
      variant: "solid",
      orientation: "horizontal",
    },
  }
);

export type DividerVariant = VariantProps<typeof dividerVariants>["variant"];
export type DividerOrientation = VariantProps<typeof dividerVariants>["orientation"];

export interface DividerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dividerVariants> {
  // 子元素（用于带文字的分隔线）
  children?: React.ReactNode;
  // 文字位置（仅水平分隔线有效）
  labelPosition?: "center" | "left" | "right";
}

/**
 * Divider 分隔线组件
 */
export function Divider({
  variant = "solid",
  orientation = "horizontal",
  labelPosition = "center",
  children,
  className,
  ...props
}: DividerProps) {
  // 带文字的水平分隔线
  if (children && orientation === "horizontal") {
    const labelAlignment = {
      left: "justify-start",
      center: "justify-center",
      right: "justify-end",
    }[labelPosition];

    return (
      <div className={cn("flex items-center gap-4 w-full", className)} {...props}>
        <div className={cn("flex-1 border-t", `border-${variant}`)} />
        <span className="text-sm text-gray-500 whitespace-nowrap">{children}</span>
        <div className={cn("flex-1 border-t", `border-${variant}`)} />
      </div>
    );
  }

  return (
    <div
      className={cn(dividerVariants({ variant, orientation }), className)}
      role="separator"
      aria-orientation={orientation}
      {...props}
    />
  );
}
