"use client";

import React from "react";
import { cn } from "@/design-system/lib/utils";

/**
 * Grid 网格布局组件
 *
 * Design System 中的网格布局组件，基于 CSS Grid。
 *
 * @example
 * ```tsx
 * // 默认网格（2列）
 * <Grid>
 *   <div>项目 1</div>
 *   <div>项目 2</div>
 * </Grid>
 *
 * // 自定义列数
 * <Grid cols={3}>
 *   <div>项目 1</div>
 *   <div>项目 2</div>
 *   <div>项目 3</div>
 * </Grid>
 *
 * // 响应式网格
 * <Grid cols={{ sm: 1, md: 2, lg: 3 }}>
 *   <div>项目 1</div>
 *   <div>项目 2</div>
 *   <div>项目 3</div>
 * </Grid>
 *
 * // 带间距的网格
 * <Grid gap={4}>
 *   <div>项目 1</div>
 *   <div>项目 2</div>
 * </Grid>
 * ```
 */

export interface ResponsiveValue {
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  "2xl"?: number;
}

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  // 列数
  cols?: number | ResponsiveValue;
  // 行间距
  rowGap?: number | string;
  // 列间距
  colGap?: number | string;
  // 间距（同时设置行列间距）
  gap?: number | string;
  // 子元素
  children: React.ReactNode;
}

/**
 * 生成网格类名
 */
function generateGridClass(cols?: number | ResponsiveValue): string {
  if (!cols) return "grid-cols-1 md:grid-cols-2";

  if (typeof cols === "number") {
    return `grid-cols-${cols}`;
  }

  // 响应式列数
  const classes = ["grid-cols-1"]; // 默认 1 列

  if (cols.sm) classes.push(`sm:grid-cols-${cols.sm}`);
  if (cols.md) classes.push(`md:grid-cols-${cols.md}`);
  if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`);
  if (cols.xl) classes.push(`xl:grid-cols-${cols.xl}`);
  if (cols["2xl"]) classes.push(`"2xl":grid-cols-${cols["2xl"]}`);

  // 如果没有指定 md，使用默认 2 列
  if (!cols.md && !cols.lg && !cols.xl && !cols["2xl"]) {
    classes.push("md:grid-cols-2");
  }

  return classes.join(" ");
}

/**
 * Grid 网格布局组件
 */
export function Grid({
  cols,
  rowGap,
  colGap,
  gap,
  className,
  children,
  ...props
}: GridProps) {
  const gridClass = generateGridClass(cols);

  return (
    <div
      className={cn(
        "grid",
        gridClass,
        gap && `gap-${gap}`,
        rowGap && `gap-y-${rowGap}`,
        colGap && `gap-x-${colGap}`,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * GridItem - 网格项
 */
export interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  // 列跨度
  colSpan?: number | ResponsiveValue;
  // 行跨度
  rowSpan?: number;
  // 子元素
  children: React.ReactNode;
}

/**
 * 生成跨度类名
 */
function generateSpanClass(
  type: "col" | "row",
  span?: number | ResponsiveValue
): string {
  if (!span) return "";

  if (typeof span === "number") {
    return `${type === "col" ? "col" : "row"}-span-${span}`;
  }

  // 响应式跨度
  const classes: string[] = [];

  if (span.sm) classes.push(`sm:${type === "col" ? "col" : "row"}-span-${span.sm}`);
  if (span.md) classes.push(`md:${type === "col" ? "col" : "row"}-span-${span.md}`);
  if (span.lg) classes.push(`lg:${type === "col" ? "col" : "row"}-span-${span.lg}`);
  if (span.xl) classes.push(`xl:${type === "col" ? "col" : "row"}-span-${span.xl}`);
  if (span["2xl"]) classes.push(`"2xl":${type === "col" ? "col" : "row"}-span-${span["2xl"]}`);

  return classes.join(" ");
}

/**
 * GridItem 网格项组件
 */
export function GridItem({
  colSpan,
  rowSpan,
  className,
  children,
  ...props
}: GridItemProps) {
  return (
    <div
      className={cn(
        generateSpanClass("col", colSpan),
        generateSpanClass("row", rowSpan),
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
