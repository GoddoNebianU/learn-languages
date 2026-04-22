"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";

/**
 * Card 卡片组件
 *
 * Design System 中的卡片容器组件，提供统一的内容包装样式。
 *
 * @example
 * ```tsx
 * // 默认卡片
 * <Card>
 *   <p>卡片内容</p>
 * </Card>
 *
 * // 带边框的卡片
 * <Card variant="bordered" padding="lg">
 *   <p>带边框的内容</p>
 * </Card>
 *
 * // 无内边距卡片
 * <Card padding="none">
 *   <img src="image.jpg" alt="完全填充的图片" />
 * </Card>
 *
 * // 可点击的卡片
 * <Card clickable onClick={handleClick}>
 *   <p>点击我</p>
 * </Card>
 * ```
 */

/**
 * 卡片变体样式
 */
const cardVariants = cva(
  // 基础样式
  "rounded-lg bg-white transition-all duration-250",
  {
    variants: {
      variant: {
        default: "shadow-xl",
        bordered: "border-2 border-gray-200 shadow-sm",
        elevated: "shadow-2xl",
        flat: "border border-gray-200 shadow-none",
      },
      padding: {
        none: "",
        xs: "p-3",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
        xl: "p-10",
      },
      clickable: {
        true: "cursor-pointer hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
      clickable: false,
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {
  children: React.ReactNode;
  disabled?: boolean;
}

/**
 * Card 卡片组件
 */
export function Card({
  variant = "default",
  padding = "md",
  clickable = false,
  className,
  children,
  onClick,
  onKeyDown,
  disabled,
  ...props
}: CardProps) {
  const isClickable = clickable || !!onClick;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isClickable && !disabled && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>);
    }
    onKeyDown?.(e);
  };

  return (
    <div
      className={cn(
        cardVariants({ variant, padding, clickable: isClickable }),
        disabled && "pointer-events-none opacity-50",
        className
      )}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable && !disabled ? 0 : undefined}
      aria-disabled={isClickable && disabled ? true : undefined}
      onClick={onClick}
      onKeyDown={isClickable ? handleKeyDown : onKeyDown}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * CardBody - 卡片主体
 */
export function CardBody({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) {
  return (
    <div className={cn("p-6", className)} {...props}>
      {children}
    </div>
  );
}
