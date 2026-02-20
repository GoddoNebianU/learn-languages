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

export type CardVariant = VariantProps<typeof cardVariants>["variant"];
export type CardPadding = VariantProps<typeof cardVariants>["padding"];

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  // 子元素
  children: React.ReactNode;
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
  ...props
}: CardProps) {
  return (
    <div
      className={cn(cardVariants({ variant, padding, clickable }), className)}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * CardSection - 卡片内容区块
 * 用于组织卡片内部的多个内容区块
 */
export interface CardSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  noPadding?: boolean;
}

export function CardSection({
  noPadding = false,
  className,
  children,
  ...props
}: CardSectionProps) {
  return (
    <div
      className={cn(
        !noPadding && "p-6",
        "first:rounded-t-2xl last:rounded-b-2xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * CardHeader - 卡片头部
 */
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardHeader({
  className,
  children,
  ...props
}: CardHeaderProps) {
  return (
    <div
      className={cn("flex items-center justify-between p-6 border-b border-gray-200", className)}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * CardTitle - 卡片标题
 */
export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export function CardTitle({
  className,
  children,
  ...props
}: CardTitleProps) {
  return (
    <h3
      className={cn("text-lg font-semibold text-gray-900", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

/**
 * CardBody - 卡片主体
 */
export const CardBody = CardSection;

/**
 * CardFooter - 卡片底部
 */
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardFooter({
  className,
  children,
  ...props
}: CardFooterProps) {
  return (
    <div
      className={cn("flex items-center justify-end gap-2 p-6 border-t border-gray-200", className)}
      {...props}
    >
      {children}
    </div>
  );
}
