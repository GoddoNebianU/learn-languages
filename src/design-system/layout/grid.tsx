"use client";

import React from "react";
import { cn } from "@/utils/cn";

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

// ===== Static lookup maps for Tailwind v4 JIT compatibility =====
// All class strings must be complete literals so Tailwind's JIT engine
// can detect and generate the corresponding CSS.

// Grid columns: 1–12
const GRID_COLS_MAP: Record<number, string> = {
  1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4",
  5: "grid-cols-5", 6: "grid-cols-6", 7: "grid-cols-7", 8: "grid-cols-8",
  9: "grid-cols-9", 10: "grid-cols-10", 11: "grid-cols-11", 12: "grid-cols-12",
};

const RESPONSIVE_COLS_MAP: Record<string, Record<number, string>> = {
  sm: { 1: "sm:grid-cols-1", 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-4", 5: "sm:grid-cols-5", 6: "sm:grid-cols-6", 7: "sm:grid-cols-7", 8: "sm:grid-cols-8", 9: "sm:grid-cols-9", 10: "sm:grid-cols-10", 11: "sm:grid-cols-11", 12: "sm:grid-cols-12" },
  md: { 1: "md:grid-cols-1", 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-4", 5: "md:grid-cols-5", 6: "md:grid-cols-6", 7: "md:grid-cols-7", 8: "md:grid-cols-8", 9: "md:grid-cols-9", 10: "md:grid-cols-10", 11: "md:grid-cols-11", 12: "md:grid-cols-12" },
  lg: { 1: "lg:grid-cols-1", 2: "lg:grid-cols-2", 3: "lg:grid-cols-3", 4: "lg:grid-cols-4", 5: "lg:grid-cols-5", 6: "lg:grid-cols-6", 7: "lg:grid-cols-7", 8: "lg:grid-cols-8", 9: "lg:grid-cols-9", 10: "lg:grid-cols-10", 11: "lg:grid-cols-11", 12: "lg:grid-cols-12" },
  xl: { 1: "xl:grid-cols-1", 2: "xl:grid-cols-2", 3: "xl:grid-cols-3", 4: "xl:grid-cols-4", 5: "xl:grid-cols-5", 6: "xl:grid-cols-6", 7: "xl:grid-cols-7", 8: "xl:grid-cols-8", 9: "xl:grid-cols-9", 10: "xl:grid-cols-10", 11: "xl:grid-cols-11", 12: "xl:grid-cols-12" },
  "2xl": { 1: "2xl:grid-cols-1", 2: "2xl:grid-cols-2", 3: "2xl:grid-cols-3", 4: "2xl:grid-cols-4", 5: "2xl:grid-cols-5", 6: "2xl:grid-cols-6", 7: "2xl:grid-cols-7", 8: "2xl:grid-cols-8", 9: "2xl:grid-cols-9", 10: "2xl:grid-cols-10", 11: "2xl:grid-cols-11", 12: "2xl:grid-cols-12" },
};

// Column span: 1–12
const COL_SPAN_MAP: Record<number, string> = {
  1: "col-span-1", 2: "col-span-2", 3: "col-span-3", 4: "col-span-4",
  5: "col-span-5", 6: "col-span-6", 7: "col-span-7", 8: "col-span-8",
  9: "col-span-9", 10: "col-span-10", 11: "col-span-11", 12: "col-span-12",
};

// Row span: 1–6
const ROW_SPAN_MAP: Record<number, string> = {
  1: "row-span-1", 2: "row-span-2", 3: "row-span-3",
  4: "row-span-4", 5: "row-span-5", 6: "row-span-6",
};

// Responsive column span
const RESPONSIVE_COL_SPAN_MAP: Record<string, Record<number, string>> = {
  sm: { 1: "sm:col-span-1", 2: "sm:col-span-2", 3: "sm:col-span-3", 4: "sm:col-span-4", 5: "sm:col-span-5", 6: "sm:col-span-6", 7: "sm:col-span-7", 8: "sm:col-span-8", 9: "sm:col-span-9", 10: "sm:col-span-10", 11: "sm:col-span-11", 12: "sm:col-span-12" },
  md: { 1: "md:col-span-1", 2: "md:col-span-2", 3: "md:col-span-3", 4: "md:col-span-4", 5: "md:col-span-5", 6: "md:col-span-6", 7: "md:col-span-7", 8: "md:col-span-8", 9: "md:col-span-9", 10: "md:col-span-10", 11: "md:col-span-11", 12: "md:col-span-12" },
  lg: { 1: "lg:col-span-1", 2: "lg:col-span-2", 3: "lg:col-span-3", 4: "lg:col-span-4", 5: "lg:col-span-5", 6: "lg:col-span-6", 7: "lg:col-span-7", 8: "lg:col-span-8", 9: "lg:col-span-9", 10: "lg:col-span-10", 11: "lg:col-span-11", 12: "lg:col-span-12" },
  xl: { 1: "xl:col-span-1", 2: "xl:col-span-2", 3: "xl:col-span-3", 4: "xl:col-span-4", 5: "xl:col-span-5", 6: "xl:col-span-6", 7: "xl:col-span-7", 8: "xl:col-span-8", 9: "xl:col-span-9", 10: "xl:col-span-10", 11: "xl:col-span-11", 12: "xl:col-span-12" },
  "2xl": { 1: "2xl:col-span-1", 2: "2xl:col-span-2", 3: "2xl:col-span-3", 4: "2xl:col-span-4", 5: "2xl:col-span-5", 6: "2xl:col-span-6", 7: "2xl:col-span-7", 8: "2xl:col-span-8", 9: "2xl:col-span-9", 10: "2xl:col-span-10", 11: "2xl:col-span-11", 12: "2xl:col-span-12" },
};

// Responsive row span
const RESPONSIVE_ROW_SPAN_MAP: Record<string, Record<number, string>> = {
  sm: { 1: "sm:row-span-1", 2: "sm:row-span-2", 3: "sm:row-span-3", 4: "sm:row-span-4", 5: "sm:row-span-5", 6: "sm:row-span-6" },
  md: { 1: "md:row-span-1", 2: "md:row-span-2", 3: "md:row-span-3", 4: "md:row-span-4", 5: "md:row-span-5", 6: "md:row-span-6" },
  lg: { 1: "lg:row-span-1", 2: "lg:row-span-2", 3: "lg:row-span-3", 4: "lg:row-span-4", 5: "lg:row-span-5", 6: "lg:row-span-6" },
  xl: { 1: "xl:row-span-1", 2: "xl:row-span-2", 3: "xl:row-span-3", 4: "xl:row-span-4", 5: "xl:row-span-5", 6: "xl:row-span-6" },
  "2xl": { 1: "2xl:row-span-1", 2: "2xl:row-span-2", 3: "2xl:row-span-3", 4: "2xl:row-span-4", 5: "2xl:row-span-5", 6: "2xl:row-span-6" },
};

// Gap utilities (standard Tailwind spacing scale as complete literal class names)
const GAP_MAP: Record<number, string> = {
  0: "gap-0", 1: "gap-1", 2: "gap-2", 3: "gap-3", 4: "gap-4",
  5: "gap-5", 6: "gap-6", 7: "gap-7", 8: "gap-8", 9: "gap-9",
  10: "gap-10", 11: "gap-11", 12: "gap-12", 14: "gap-14", 16: "gap-16",
  20: "gap-20", 24: "gap-24", 28: "gap-28", 32: "gap-32", 36: "gap-36",
  40: "gap-40", 44: "gap-44", 48: "gap-48", 52: "gap-52", 56: "gap-56",
  60: "gap-60", 64: "gap-64", 72: "gap-72", 80: "gap-80", 96: "gap-96",
};

const GAP_X_MAP: Record<number, string> = {
  0: "gap-x-0", 1: "gap-x-1", 2: "gap-x-2", 3: "gap-x-3", 4: "gap-x-4",
  5: "gap-x-5", 6: "gap-x-6", 7: "gap-x-7", 8: "gap-x-8", 9: "gap-x-9",
  10: "gap-x-10", 11: "gap-x-11", 12: "gap-x-12", 14: "gap-x-14", 16: "gap-x-16",
  20: "gap-x-20", 24: "gap-x-24", 28: "gap-x-28", 32: "gap-x-32", 36: "gap-x-36",
  40: "gap-x-40", 44: "gap-x-44", 48: "gap-x-48", 52: "gap-x-52", 56: "gap-x-56",
  60: "gap-x-60", 64: "gap-x-64", 72: "gap-x-72", 80: "gap-x-80", 96: "gap-x-96",
};

const GAP_Y_MAP: Record<number, string> = {
  0: "gap-y-0", 1: "gap-y-1", 2: "gap-y-2", 3: "gap-y-3", 4: "gap-y-4",
  5: "gap-y-5", 6: "gap-y-6", 7: "gap-y-7", 8: "gap-y-8", 9: "gap-y-9",
  10: "gap-y-10", 11: "gap-y-11", 12: "gap-y-12", 14: "gap-y-14", 16: "gap-y-16",
  20: "gap-y-20", 24: "gap-y-24", 28: "gap-y-28", 32: "gap-y-32", 36: "gap-y-36",
  40: "gap-y-40", 44: "gap-y-44", 48: "gap-y-48", 52: "gap-y-52", 56: "gap-y-56",
  60: "gap-y-60", 64: "gap-y-64", 72: "gap-y-72", 80: "gap-y-80", 96: "gap-y-96",
};

/**
 * Resolve a gap value to a Tailwind class string.
 * Uses lookup map for standard spacing values; arbitrary value syntax for custom values.
 */
function resolveGapClass(
  value: number | string | undefined,
  map: Record<number, string>,
  prefix: string,
): string | undefined {
  if (value == null) return undefined;
  if (typeof value === "string") return `${prefix}-[${value}]`;
  return map[value] ?? `${prefix}-[${value * 0.25}rem]`;
}

/**
 * 生成网格类名
 */
function generateGridClass(cols?: number | ResponsiveValue): string {
  if (!cols) return "grid-cols-1 md:grid-cols-2";

  if (typeof cols === "number") {
    return GRID_COLS_MAP[cols] ?? "";
  }

  // 响应式列数
  const classes = ["grid-cols-1"]; // 默认 1 列

  if (cols.sm) classes.push(RESPONSIVE_COLS_MAP.sm[cols.sm] ?? "");
  if (cols.md) classes.push(RESPONSIVE_COLS_MAP.md[cols.md] ?? "");
  if (cols.lg) classes.push(RESPONSIVE_COLS_MAP.lg[cols.lg] ?? "");
  if (cols.xl) classes.push(RESPONSIVE_COLS_MAP.xl[cols.xl] ?? "");
  if (cols["2xl"]) classes.push(RESPONSIVE_COLS_MAP["2xl"][cols["2xl"]] ?? "");

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
        resolveGapClass(gap, GAP_MAP, "gap"),
        resolveGapClass(rowGap, GAP_Y_MAP, "gap-y"),
        resolveGapClass(colGap, GAP_X_MAP, "gap-x"),
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

  const baseMap = type === "col" ? COL_SPAN_MAP : ROW_SPAN_MAP;
  const responsiveMap = type === "col" ? RESPONSIVE_COL_SPAN_MAP : RESPONSIVE_ROW_SPAN_MAP;

  if (typeof span === "number") {
    return baseMap[span] ?? "";
  }

  // 响应式跨度
  const classes: string[] = [];

  if (span.sm) classes.push(responsiveMap.sm[span.sm] ?? "");
  if (span.md) classes.push(responsiveMap.md[span.md] ?? "");
  if (span.lg) classes.push(responsiveMap.lg[span.lg] ?? "");
  if (span.xl) classes.push(responsiveMap.xl[span.xl] ?? "");
  if (span["2xl"]) classes.push(responsiveMap["2xl"][span["2xl"]] ?? "");

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
