"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";

/**
 * Progress 进度条组件
 *
 * Design System 中的进度条组件，用于显示任务完成进度。
 *
 * @example
 * ```tsx
 * // 默认进度条
 * <Progress value={60} />
 *
 * // 不同尺寸
 * <Progress value={60} size="sm" />
 * <Progress value={60} size="lg" />
 *
 * // 不同变体
 * <Progress variant="success" value={100} />
 * <Progress variant="warning" value={75} />
 * <Progress variant="error" value={30} />
 *
 * // 无标签
 * <Progress value={60} showLabel={false} />
 *
 * // 自定义颜色
 * <Progress value={60} color="#35786f" />
 * ```
 */

/**
 * Progress 变体样式
 */
const progressVariants = cva(
  // 基础样式
  "overflow-hidden rounded-full bg-gray-200 transition-all duration-250",
  {
    variants: {
      size: {
        sm: "h-1.5",
        md: "h-2",
        lg: "h-3",
      },
      variant: {
        default: "",
        success: "",
        warning: "",
        error: "",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
);

export type ProgressSize = VariantProps<typeof progressVariants>["size"];
export type ProgressVariant = VariantProps<typeof progressVariants>["variant"];

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants> {
  // 进度值（0-100）
  value: number;
  // 是否显示百分比标签
  showLabel?: boolean;
  // 自定义标签
  label?: string;
  // 是否显示动画
  animated?: boolean;
  // 自定义颜色（覆盖 variant）
  color?: string;
}

/**
 * Progress 进度条组件
 */
export function Progress({
  value = 0,
  size = "md",
  variant = "default",
  showLabel = true,
  label,
  animated = true,
  color,
  className,
  ...props
}: ProgressProps) {
  // 确保值在 0-100 之间
  const clampedValue = Math.min(100, Math.max(0, value));

  // 计算颜色
  const getColor = () => {
    if (color) return color;
    const colors = {
      default: "bg-primary-500",
      success: "bg-success-500",
      warning: "bg-warning-500",
      error: "bg-error-500",
    };
    const actualVariant = variant ?? "default";
    return colors[actualVariant];
  };

  // 格式化标签
  const formatLabel = () => {
    if (label !== undefined) return label;
    return `${Math.round(clampedValue)}%`;
  };

  return (
    <div className={cn("w-full", className)} {...props}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex-1">
          <div
            className={cn(progressVariants({ size, variant }))}
            role="progressbar"
            aria-valuenow={clampedValue}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500 ease-out",
                getColor(),
                animated && "animate-pulse"
              )}
              style={{ width: `${clampedValue}%` }}
            />
          </div>
        </div>
        {showLabel && (
          <div className="ml-3 text-sm font-medium text-gray-700 min-w-12 text-right">
            {formatLabel()}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * CircularProgress - 环形进度条
 */
export interface CircularProgressProps extends React.SVGProps<SVGSVGElement> {
  value: number;
  size?: number;
  strokeWidth?: number;
  variant?: ProgressVariant;
  showLabel?: boolean;
  label?: string;
}

export function CircularProgress({
  value = 0,
  size = 120,
  strokeWidth = 8,
  variant = "default",
  showLabel = true,
  label,
  className,
  ...props
}: CircularProgressProps) {
  const clampedValue = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedValue / 100) * circumference;

  const colorClasses: Record<string, string> = {
    default: "text-primary-500",
    success: "text-green-500",
    warning: "text-amber-500",
    error: "text-red-500",
  };

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", colorClasses[variant ?? "default"], className)}
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg
        width={size}
        height={size}
        aria-hidden="true"
        {...props}
      >
        {/* 背景圆 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200"
        />
        {/* 进度圆 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {showLabel && (
        <div className="absolute text-base font-semibold text-gray-700">
          {label !== undefined ? label : `${Math.round(clampedValue)}%`}
        </div>
      )}
    </div>
  );
}
