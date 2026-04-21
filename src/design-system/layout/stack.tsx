"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";

// Static gap lookup map for Tailwind v4 JIT compatibility
// (complete literal class strings required — dynamic interpolation is invisible to JIT)
const GAP_MAP: Record<number, string> = {
  0: "gap-0", 1: "gap-1", 2: "gap-2", 3: "gap-3", 4: "gap-4",
  5: "gap-5", 6: "gap-6", 7: "gap-7", 8: "gap-8", 9: "gap-9",
  10: "gap-10", 11: "gap-11", 12: "gap-12", 14: "gap-14", 16: "gap-16",
  20: "gap-20", 24: "gap-24", 28: "gap-28", 32: "gap-32", 36: "gap-36",
  40: "gap-40", 44: "gap-44", 48: "gap-48", 52: "gap-52", 56: "gap-56",
  60: "gap-60", 64: "gap-64", 72: "gap-72", 80: "gap-80", 96: "gap-96",
};

/**
 * Stack 堆叠布局组件
 *
 * Design System 中的堆叠布局组件，用于垂直或水平排列子元素。
 *
 * @example
 * ```tsx
 * // 垂直堆叠
 * <Stack>
 *   <div>项目 1</div>
 *   <div>项目 2</div>
 *   <div>项目 3</div>
 * </Stack>
 *
 * // 水平堆叠
 * <Stack direction="row">
 *   <div>项目 1</div>
 *   <div>项目 2</div>
 *   <div>项目 3</div>
 * </Stack>
 *
 * // 自定义间距
 * <Stack gap={4}>
 *   <div>项目 1</div>
 *   <div>项目 2</div>
 * </Stack>
 *
 * // 居中对齐
 * <Stack align="center">
 *   <div>项目 1</div>
 *   <div>项目 2</div>
 * </Stack>
 * ```
 */

/**
 * Stack 变体样式
 */
const stackVariants = cva(
  // 基础样式
  "flex",
  {
    variants: {
      direction: {
        column: "flex-col",
        row: "flex-row",
      },
      align: {
        start: "items-start",
        center: "items-center",
        end: "items-end",
        stretch: "items-stretch",
      },
      justify: {
        start: "justify-start",
        center: "justify-center",
        end: "justify-end",
        between: "justify-between",
      },
      wrap: {
        true: "flex-wrap",
        false: "flex-nowrap",
      },
    },
    defaultVariants: {
      direction: "column",
      align: "start",
      justify: "start",
      wrap: false,
    },
  }
);

export type StackDirection = VariantProps<typeof stackVariants>["direction"];
export type StackAlign = VariantProps<typeof stackVariants>["align"];
export type StackJustify = VariantProps<typeof stackVariants>["justify"];

export interface StackProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stackVariants> {
  // 子元素
  children: React.ReactNode;
  // 间距（使用 Tailwind spacing）
  gap?: number | string;
  // 是否为内联布局
  inline?: boolean;
}

/**
 * Stack 堆叠布局组件
 */
export function Stack({
  direction = "column",
  align = "start",
  justify = "start",
  wrap = false,
  gap,
  inline = false,
  className,
  children,
  ...props
}: StackProps) {
  return (
    <div
      className={cn(
        stackVariants({ direction, align, justify, wrap }),
        gap && (typeof gap === "number" ? (GAP_MAP[gap] ?? `gap-[${gap * 0.25}rem]`) : `gap-[${gap}]`),
        inline && "inline-flex",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * VStack - 垂直堆叠组件（快捷方式）
 */
export interface VStackProps extends Omit<StackProps, "direction"> {}

export function VStack(props: VStackProps) {
  return <Stack direction="column" {...props} />;
}

/**
 * HStack - 水平堆叠组件（快捷方式）
 */
export interface HStackProps extends Omit<StackProps, "direction"> {}

export function HStack(props: HStackProps) {
  return <Stack direction="row" {...props} />;
}
