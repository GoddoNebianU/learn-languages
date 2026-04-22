"use client";

/**
 * Range - 范围滑块组件
 *
 * 支持自定义进度条颜色、禁用状态和样式覆盖的滑块输入组件。
 *
 * @example
 * ```tsx
 * import { Range } from '@/design-system/range';
 *
 * <Range value={50} min={0} max={100} onChange={setValue} />
 * <Range value={75} min={0} max={100} disabled />
 * ```
 */

import * as React from "react";
import { cn } from "@/utils/cn";

export interface RangeProps extends Omit<React.ComponentPropsWithoutRef<"input">, "onChange"> {
  /** 当前值 */
  value: number;
  /** 值变化回调 */
  onChange: (value: number) => void;
  /** 最小值 (默认: 0) */
  min?: number;
  /** 最大值 */
  max: number;
}

export const Range = React.forwardRef<HTMLInputElement, RangeProps>(
  ({ value, min = 0, max, onChange, disabled = false, className, ...props }, ref) => {
    const handleChange = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseInt(event.target.value);
        onChange(newValue);
      },
      [onChange]
    );

    const progressPercentage = ((value - min) / (max - min)) * 100;

    return (
      <input
        ref={ref}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className={cn(
          "h-2 w-full cursor-pointer appearance-none rounded-lg",
          "focus:ring-2 focus:ring-primary-500 focus:outline-none",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
        style={{
          background: `linear-gradient(to right, var(--color-primary-700, #374151) 0%, var(--color-primary-700, #374151) ${progressPercentage}%, var(--color-border, #e5e7eb) ${progressPercentage}%, var(--color-border, #e5e7eb) 100%)`,
        }}
        {...props}
      />
    );
  }
);

Range.displayName = "Range";

// 向后兼容别名
export const RangeInput = Range;
