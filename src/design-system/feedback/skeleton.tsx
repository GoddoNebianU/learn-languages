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

export type SkeletonVariant = VariantProps<typeof skeletonVariants>["variant"];

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

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
      className={cn(
        "bg-gray-200",
        skeletonVariants({ variant, animated }),
        className
      )}
      {...props}
    />
  );
}

/**
 * 预设的骨架屏组合
 */

/**
 * 文本骨架屏（多行）
 */
export interface TextSkeletonProps {
  lines?: number;
  className?: string;
}

export function TextSkeleton({ lines = 3, className }: TextSkeletonProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className={cn(i === lines - 1 && "w-3/4")}
        />
      ))}
    </div>
  );
}

/**
 * 卡片骨架屏
 */
export interface CardSkeletonProps {
  showAvatar?: boolean;
  className?: string;
}

export function CardSkeleton({
  showAvatar = false,
  className,
}: CardSkeletonProps) {
  return (
    <div className={cn("p-6 space-y-4", className)}>
      {showAvatar && (
        <div className="flex items-center space-x-4">
          <Skeleton variant="circular" className="h-12 w-12" />
          <div className="space-y-2 flex-1">
            <Skeleton variant="text" className="w-1/3" />
            <Skeleton variant="text" className="w-1/4" />
          </div>
        </div>
      )}
      <TextSkeleton lines={3} />
    </div>
  );
}

/**
 * 列表项骨架屏
 */
export interface ListItemSkeletonProps {
  showAvatar?: boolean;
  className?: string;
}

export function ListItemSkeleton({
  showAvatar = true,
  className,
}: ListItemSkeletonProps) {
  return (
    <div className={cn("flex items-center space-x-4 p-4", className)}>
      {showAvatar && <Skeleton variant="circular" className="h-10 w-10" />}
      <div className="space-y-2 flex-1">
        <Skeleton variant="text" className="w-3/4" />
        <Skeleton variant="text" className="w-1/2" />
      </div>
    </div>
  );
}

/**
 * 表格骨架屏
 */
export interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function TableSkeleton({
  rows = 5,
  columns = 4,
  className,
}: TableSkeletonProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {/* 表头 */}
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`header-${i}`} variant="text" className="flex-1" />
        ))}
      </div>
      {/* 表体 */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={`cell-${rowIndex}-${colIndex}`}
              variant="text"
              className="flex-1"
            />
          ))}
        </div>
      ))}
    </div>
  );
}
