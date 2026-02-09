"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/design-system/lib/utils";

/**
 * Button 组件
 *
 * Design System 中的按钮组件，支持多种变体、尺寸和状态。
 * 自动处理 Link/button 切换，支持图标和加载状态。
 *
 * @example
 * ```tsx
 * // Primary 按钮
 * <Button variant="primary" onClick={handleClick}>
 *   点击我
 * </Button>
 *
 * // 带图标的按钮
 * <Button variant="secondary" leftIcon={<Icon />}>
 *   带图标
 * </Button>
 *
 * // 作为链接使用
 * <Button variant="primary" href="/path">
 *   链接按钮
 * </Button>
 *
 * // 加载状态
 * <Button variant="primary" loading>
 *   提交中...
 * </Button>
 * ```
 */

/**
 * 按钮变体样式
 */
const buttonVariants = cva(
  // 基础样式
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold shadow transition-all duration-250 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary-500 text-white hover:bg-primary-600 shadow-md",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 shadow-sm",
        success: "bg-success-500 text-white hover:bg-success-600 shadow-md",
        warning: "bg-warning-500 text-white hover:bg-warning-600 shadow-md",
        error: "bg-error-500 text-white hover:bg-error-600 shadow-md",
        ghost: "bg-transparent text-gray-700 hover:bg-gray-100 shadow-none",
        outline: "border-2 border-gray-300 text-gray-700 hover:bg-gray-50 shadow-none",
        link: "text-primary-500 hover:text-primary-600 hover:underline shadow-none px-0",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-base",
        lg: "h-12 px-6 text-lg",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    compoundVariants: [
      // 链接变体不应用高度和圆角
      {
        variant: "link",
        size: "sm",
        className: "h-auto px-0",
      },
      {
        variant: "link",
        size: "md",
        className: "h-auto px-0",
      },
      {
        variant: "link",
        size: "lg",
        className: "h-auto px-0",
      },
    ],
    defaultVariants: {
      variant: "secondary",
      size: "md",
      fullWidth: false,
    },
  }
);

export type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];
export type ButtonSize = VariantProps<typeof buttonVariants>["size"];

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  // 内容
  children?: React.ReactNode;

  // 导航
  href?: string;
  openInNewTab?: boolean;

  // 图标
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  iconSrc?: string; // For Next.js Image icons
  iconAlt?: string;

  // 状态
  loading?: boolean;
  selected?: boolean;

  // 样式
  className?: string;
}

/**
 * Button 组件
 */
export function Button({
  variant = "secondary",
  size = "md",
  fullWidth = false,
  href,
  openInNewTab = false,
  iconSrc,
  iconAlt,
  leftIcon,
  rightIcon,
  children,
  className,
  loading = false,
  selected = false,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  // 计算样式
  const computedClass = cn(
    buttonVariants({ variant, size, fullWidth }),
    selected && variant === "secondary" && "bg-gray-200",
    className
  );

  // 图标尺寸映射
  const iconSize = { sm: 14, md: 16, lg: 20 }[size];

  // 渲染 SVG 图标
  const renderSvgIcon = (icon: React.ReactNode, position: "left" | "right") => {
    if (!icon) return null;
    return (
      <span className={`flex items-center shrink-0 ${position === "left" ? "-ml-1 mr-2" : "-mr-1 ml-2"}`}>
        {icon}
      </span>
    );
  };

  // 渲染 Next.js Image 图标
  const renderImageIcon = () => {
    if (!iconSrc) return null;
    return (
      <Image
        src={iconSrc}
        width={iconSize}
        height={iconSize}
        alt={iconAlt || "icon"}
        className="shrink-0"
      />
    );
  };

  // 渲染加载图标
  const renderLoadingIcon = () => {
    if (!loading) return null;
    return (
      <svg
        className="animate-spin h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );
  };

  // 组装内容
  const content = (
    <>
      {loading && renderLoadingIcon()}
      {renderImageIcon()}
      {renderSvgIcon(leftIcon, "left")}
      {children}
      {renderSvgIcon(rightIcon, "right")}
    </>
  );

  // 如果提供了 href，渲染为 Link
  if (href) {
    return (
      <Link
        href={href}
        className={computedClass}
        target={openInNewTab ? "_blank" : undefined}
        rel={openInNewTab ? "noopener noreferrer" : undefined}
      >
        {content}
      </Link>
    );
  }

  // 否则渲染为 button
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={computedClass}
      {...props}
    >
      {content}
    </button>
  );
}

/**
 * 预定义的按钮快捷组件
 */
export const PrimaryButton = (props: Omit<ButtonProps, "variant">) => (
  <Button variant="primary" {...props} />
);

export const SecondaryButton = (props: Omit<ButtonProps, "variant">) => (
  <Button variant="secondary" {...props} />
);

export const SuccessButton = (props: Omit<ButtonProps, "variant">) => (
  <Button variant="success" {...props} />
);

export const WarningButton = (props: Omit<ButtonProps, "variant">) => (
  <Button variant="warning" {...props} />
);

export const ErrorButton = (props: Omit<ButtonProps, "variant">) => (
  <Button variant="error" {...props} />
);

export const GhostButton = (props: Omit<ButtonProps, "variant">) => (
  <Button variant="ghost" {...props} />
);

export const OutlineButton = (props: Omit<ButtonProps, "variant">) => (
  <Button variant="outline" {...props} />
);

export const LinkButton = (props: Omit<ButtonProps, "variant">) => (
  <Button variant="link" {...props} />
);
