"use client";

import React, { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/design-system/lib/utils";

/**
 * Radio 单选按钮组件
 *
 * Design System 中的单选按钮组件，支持多种状态和尺寸。
 *
 * @example
 * ```tsx
 * // 默认单选按钮
 * <Radio name="choice" value="1">选项 1</Radio>
 * <Radio name="choice" value="2">选项 2</Radio>
 *
 * // 受控组件
 * <Radio
 *   name="choice"
 *   value="1"
 *   checked={value === "1"}
 *   onChange={(e) => setValue(e.target.value)}
 * >
 *   选项 1
 * </Radio>
 * ```
 */

/**
 * 单选按钮变体样式
 */
const radioVariants = cva(
  // 基础样式
  "peer h-4 w-4 shrink-0 rounded-full border-2 transition-all duration-250 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer",
  {
    variants: {
      variant: {
        default: "border-gray-300 checked:border-primary-500",
        success: "border-gray-300 checked:border-success-500",
        warning: "border-gray-300 checked:border-warning-500",
        error: "border-gray-300 checked:border-error-500",
      },
      size: {
        sm: "h-3.5 w-3.5",
        md: "h-4 w-4",
        lg: "h-5 w-5",
      },
      error: {
        true: "border-error-500",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      error: false,
    },
  }
);

export type RadioVariant = VariantProps<typeof radioVariants>["variant"];
export type RadioSize = VariantProps<typeof radioVariants>["size"];

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof radioVariants> {
  // 标签文本
  label?: React.ReactNode;
  // 标签位置
  labelPosition?: "left" | "right";
  // 自定义单选按钮类名
  radioClassName?: string;
}

/**
 * Radio 单选按钮组件
 */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      variant = "default",
      size = "md",
      error = false,
      label,
      labelPosition = "right",
      className,
      radioClassName,
      disabled,
      ...props
    },
    ref
  ) => {
    const radioId = React.useId();

    const renderRadio = () => (
      <div className="relative">
        <input
          ref={ref}
          type="radio"
          id={radioId}
          disabled={disabled}
          className={cn(
            radioVariants({ variant, size, error }),
            "peer/radio",
            radioClassName
          )}
          {...props}
        />
        {/* 选中状态的圆点 */}
        <div
          className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none transition-all duration-250",
            "peer-checked/radio:bg-current",
            size === "sm" && "h-1.5 w-1.5",
            size === "md" && "h-2 w-2",
            size === "lg" && "h-2.5 w-2.5",
            variant === "default" && "text-primary-500",
            variant === "success" && "text-success-500",
            variant === "warning" && "text-warning-500",
            variant === "error" && "text-error-500"
          )}
        />
      </div>
    );

    const renderLabel = () => {
      if (!label) return null;

      return (
        <label
          htmlFor={radioId}
          className={cn(
            "text-base font-normal leading-none",
            disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
            labelPosition === "left" ? "mr-2" : "ml-2"
          )}
        >
          {label}
        </label>
      );
    };

    if (!label) {
      return renderRadio();
    }

    return (
      <div className={cn("inline-flex items-center", className)}>
        {labelPosition === "left" && renderLabel()}
        {renderRadio()}
        {labelPosition === "right" && renderLabel()}
      </div>
    );
  }
);

Radio.displayName = "Radio";

/**
 * RadioGroup - 单选按钮组
 */
export interface RadioGroupProps {
  children: React.ReactNode;
  name: string;
  label?: string;
  error?: string;
  required?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  orientation?: "vertical" | "horizontal";
}

export function RadioGroup({
  children,
  name,
  label,
  error,
  required,
  value,
  onChange,
  className,
  orientation = "vertical",
}: RadioGroupProps) {
  // 为每个 Radio 注入 name 和 onChange
  const enhancedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      const childProps = child.props as { value?: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void };
      return React.cloneElement(child as React.ReactElement<any>, {
        name,
        checked: value !== undefined ? childProps.value === value : undefined,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
          onChange?.(e.target.value);
          childProps.onChange?.(e);
        },
      });
    }
    return child;
  });

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <div className="text-base font-medium text-gray-900">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </div>
      )}
      <div
        className={cn(
          orientation === "vertical" ? "space-y-2" : "flex gap-4"
        )}
      >
        {enhancedChildren}
      </div>
      {error && <p className="text-sm text-error-500">{error}</p>}
    </div>
  );
}
