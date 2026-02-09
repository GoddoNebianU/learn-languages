"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/design-system/lib/utils";

/**
 * Badge 徽章组件
 *
 * Design System 中的徽章组件，用于显示状态、标签等信息。
 *
 * @example
 * ```tsx
 * // 默认徽章
 * <Badge>新</Badge>
 *
 * // 不同变体
 * <Badge variant="success">成功</Badge>
 * <Badge variant="warning">警告</Badge>
 * <Badge variant="error">错误</Badge>
 *
 * // 不同尺寸
 * <Badge size="sm">小</Badge>
 * <Badge size="lg">大</Badge>
 *
 * // 圆形徽章
 * <Badge variant="primary" dot />
 * ```
 */

/**
 * Badge 变体样式
 */
const badgeVariants = cva(
  // 基础样式
  "inline-flex items-center justify-center rounded-full font-medium transition-colors duration-250",
  {
    variants: {
      variant: {
        default: "bg-gray-100 text-gray-800",
        primary: "bg-primary-100 text-primary-800",
        success: "bg-success-100 text-success-800",
        warning: "bg-warning-100 text-warning-800",
        error: "bg-error-100 text-error-800",
        info: "bg-info-100 text-info-800",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-1 text-sm",
        lg: "px-3 py-1.5 text-base",
      },
      dot: {
        true: "px-2 py-1",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      dot: false,
    },
  }
);

export type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];
export type BadgeSize = VariantProps<typeof badgeVariants>["size"];

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  // 子元素
  children?: React.ReactNode;
  // 是否为圆点样式（不显示文字）
  dot?: boolean;
  // 圆点颜色（仅当 dot=true 时有效）
  dotColor?: string;
}

/**
 * Badge 徽章组件
 */
export function Badge({
  variant = "default",
  size = "md",
  dot = false,
  dotColor,
  className,
  children,
  ...props
}: BadgeProps) {
  // 圆点颜色映射
  const dotColors = {
    default: "bg-gray-400",
    primary: "bg-primary-500",
    success: "bg-success-500",
    warning: "bg-warning-500",
    error: "bg-error-500",
    info: "bg-info-500",
  };

  return (
    <div className={cn(badgeVariants({ variant, size, dot }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            "h-2 w-2 rounded-full",
            dotColor || dotColors[variant]
          )}
        />
      )}
      {!dot && children}
    </div>
  );
}

/**
 * StatusBadge - 状态徽章
 */
export interface StatusBadgeProps extends Omit<BadgeProps, "variant" | "children"> {
  status: "online" | "offline" | "busy" | "away";
  label?: string;
}

export function StatusBadge({ status, label, ...props }: StatusBadgeProps) {
  const statusConfig = {
    online: { variant: "success" as const, defaultLabel: "在线" },
    offline: { variant: "default" as const, defaultLabel: "离线" },
    busy: { variant: "error" as const, defaultLabel: "忙碌" },
    away: { variant: "warning" as const, defaultLabel: "离开" },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} {...props}>
      {label || config.defaultLabel}
    </Badge>
  );
}

/**
 * CounterBadge - 计数徽章
 */
export interface CounterBadgeProps extends Omit<BadgeProps, "children"> {
  count: number;
  max?: number;
}

export function CounterBadge({ count, max = 99, ...props }: CounterBadgeProps) {
  const displayCount = count > max ? `${max}+` : count;

  return (
    <Badge variant="error" size="sm" {...props}>
      {displayCount}
    </Badge>
  );
}
