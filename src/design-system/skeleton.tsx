"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";

/**
 * Skeleton 骨架屏组件
 *
 * Design System 中的骨架屏组件，用于内容加载时的占位显示。
 *
 * @example
 * ```tsx
 * // 默认骨架屏
 * <Skeleton className="h-4 w-32" />
 *
 * // 不同变体
 * <Skeleton variant="text" />
 * <Skeleton variant="circular" className="h-12 w-12" />
 * <Skeleton variant="rectangular" className="h-32 w-full" />
 *
 * // 自定义动画
 * <Skeleton animated={false} />
 * ```
 */

/**
 * Skeleton 变体样式
 */
const skeletonVariants = cva(
  // 基础样式
  "shrink-0 animate-pulse rounded",
  {
    variants: {
      variant: {
        text: "h-4 w-full",
        circular: "rounded-full",
        rectangular: "rounded-lg",
      },
      animated: {
        true: "animate-pulse",
        false: "",
      },
    },
    defaultVariants: {
      variant: "text",
      animated: true,
    },
  }
);

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof skeletonVariants> {}

/**
 * Skeleton 骨架屏组件
 */
export function Skeleton({
  variant = "text",
  animated = true,
  className,
  ...props
}: SkeletonProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      className={cn("bg-gray-200", skeletonVariants({ variant, animated }), className)}
      {...props}
    />
  );
}
