"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/design-system/lib/utils";

/**
 * Container 容器组件
 *
 * Design System 中的容器组件，用于约束内容宽度并居中。
 *
 * @example
 * ```tsx
 * // 默认容器
 * <Container>
 *   <p>内容被居中并限制最大宽度</p>
 * </Container>
 *
 * // 不同尺寸
 * <Container size="sm">小容器</Container>
 * <Container size="lg">大容器</Container>
 *
 * // 全宽容器
 * <Container fullWidth>全宽容器</Container>
 *
 * // 带内边距
 * <Container padding="xl">带内边距的容器</Container>
 * ```
 */

/**
 * Container 变体样式
 */
const containerVariants = cva(
  // 基础样式
  "mx-auto",
  {
    variants: {
      size: {
        xs: "max-w-xs",
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
        "2xl": "max-w-2xl",
        "3xl": "max-w-3xl",
        "4xl": "max-w-4xl",
        "5xl": "max-w-5xl",
        "6xl": "max-w-6xl",
        "7xl": "max-w-7xl",
        full: "max-w-full",
      },
      padding: {
        none: "",
        xs: "px-2",
        sm: "px-4",
        md: "px-6",
        lg: "px-8",
        xl: "px-10",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      size: "7xl",
      padding: "md",
      fullWidth: false,
    },
  }
);

export type ContainerSize = VariantProps<typeof containerVariants>["size"];
export type ContainerPadding = VariantProps<typeof containerVariants>["padding"];

export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {
  // 子元素
  children: React.ReactNode;
}

/**
 * Container 容器组件
 */
export function Container({
  size = "7xl",
  padding = "md",
  fullWidth = false,
  className,
  children,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(containerVariants({ size, padding, fullWidth }), className)}
      {...props}
    >
      {children}
    </div>
  );
}
