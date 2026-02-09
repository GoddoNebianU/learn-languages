"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/design-system/lib/utils";

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
        gap && (typeof gap === "number" ? `gap-${gap}` : `gap-[${gap}]`),
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
