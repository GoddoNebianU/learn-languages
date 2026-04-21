"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";

/**
 * Alert 警告提示组件
 *
 * Design System 中的警告提示组件，用于显示重要信息。
 *
 * @example
 * ```tsx
 * // 默认提示
 * <Alert>这是一条普通提示</Alert>
 *
 * // 成功提示
 * <Alert variant="success">操作成功！</Alert>
 *
 * // 错误提示（带标题）
 * <Alert variant="error" title="错误">
 *   发生了一些问题
 * </Alert>
 *
 * // 可关闭的提示
 * <Alert variant="warning" closable onClose={handleClose}>
 *   请注意此警告
 * </Alert>
 * ```
 */

/**
 * Alert 变体样式
 */
const alertVariants = cva(
  // 基础样式
  "rounded-lg border-2 px-4 py-3 shadow-sm transition-all duration-250",
  {
    variants: {
      variant: {
        info: "border-info-500 bg-info-50 text-info-900",
        success: "border-success-500 bg-success-50 text-success-900",
        warning: "border-warning-500 bg-warning-50 text-warning-900",
        error: "border-error-500 bg-error-50 text-error-900",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
);

export type AlertVariant = VariantProps<typeof alertVariants>["variant"];

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  // 标题
  title?: string;
  // 是否可关闭
  closable?: boolean;
  // 关闭回调
  onClose?: () => void;
  // 自定义图标
  icon?: React.ReactNode;
}

// 默认图标
const defaultIcons = {
  info: (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
        clipRule="evenodd"
      />
    </svg>
  ),
  success: (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  ),
  warning: (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
        clipRule="evenodd"
      />
    </svg>
  ),
  error: (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
        clipRule="evenodd"
      />
    </svg>
  ),
};

/**
 * Alert 警告提示组件
 */
export function Alert({
  variant = "info",
  title,
  closable = false,
  onClose,
  icon,
  className,
  children,
  ...props
}: AlertProps) {
  const [visible, setVisible] = React.useState(true);

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  if (!visible) return null;

  // 确保 variant 有默认值
  const actualVariant = variant ?? "info";

  // 图标颜色
  const iconColors = {
    info: "text-info-500",
    success: "text-success-500",
    warning: "text-warning-500",
    error: "text-error-500",
  };

  return (
    <div
      className={cn(alertVariants({ variant: actualVariant }), className)}
      role="alert"
      {...props}
    >
      <div className="flex items-start gap-3">
        {/* 图标 */}
        <div className={cn("shrink-0", iconColors[actualVariant])}>
          {icon || defaultIcons[actualVariant]}
        </div>

        {/* 内容 */}
        <div className="flex-1 min-w-0">
          {title && (
            <h5 className="mb-1 font-semibold leading-tight">{title}</h5>
          )}
          <div className="text-sm leading-relaxed">{children}</div>
        </div>

        {/* 关闭按钮 */}
        {closable && (
          <button
            onClick={handleClose}
            className="shrink-0 rounded-lg p-1 hover:bg-black/5 transition-colors"
            aria-label="Close"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * 快捷组件
 */
export const InfoAlert = (props: Omit<AlertProps, "variant">) => (
  <Alert variant="info" {...props} />
);

export const SuccessAlert = (props: Omit<AlertProps, "variant">) => (
  <Alert variant="success" {...props} />
);

export const WarningAlert = (props: Omit<AlertProps, "variant">) => (
  <Alert variant="warning" {...props} />
);

export const ErrorAlert = (props: Omit<AlertProps, "variant">) => (
  <Alert variant="error" {...props} />
);
