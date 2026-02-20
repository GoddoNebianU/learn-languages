"use client";

import React, { useState } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";

/**
 * Tabs 标签页组件
 *
 * Design System 中的标签页组件，用于内容分组和切换。
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const [activeTab, setActiveTab] = useState("tab1");
 *
 *   return (
 *     <Tabs value={activeTab} onValueChange={setActiveTab}>
 *       <Tabs.List>
 *         <Tabs.Trigger value="tab1">标签 1</Tabs.Trigger>
 *         <Tabs.Trigger value="tab2">标签 2</Tabs.Trigger>
 *         <Tabs.Trigger value="tab3">标签 3</Tabs.Trigger>
 *       </Tabs.List>
 *       <Tabs.Content value="tab1">
 *         <p>内容 1</p>
 *       </Tabs.Content>
 *       <Tabs.Content value="tab2">
 *         <p>内容 2</p>
 *       </Tabs.Content>
 *       <Tabs.Content value="tab3">
 *         <p>内容 3</p>
 *       </Tabs.Content>
 *     </Tabs>
 *   );
 * }
 * ```
 */

export interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
  variant?: "line" | "enclosed" | "soft";
}

/**
 * Tabs 组件
 */
export function Tabs({
  value,
  onValueChange,
  children,
  className,
  variant = "line",
}: TabsProps) {
  return (
    <div className={cn("w-full", className)} data-variant={variant}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            value,
            onValueChange,
            variant,
          } as any);
        }
        return child;
      })}
    </div>
  );
}

/**
 * Tabs.List - 标签列表
 */
export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "line" | "enclosed" | "soft";
}

const listVariants = cva(
  "flex",
  {
    variants: {
      variant: {
        line: "border-b border-gray-200",
        enclosed: "bg-gray-100 p-1 rounded-lg gap-1",
        soft: "gap-2",
      },
    },
    defaultVariants: {
      variant: "line",
    },
  }
);

export function TabsList({
  children,
  variant = "line",
  className,
  ...props
}: TabsListProps) {
  return (
    <div
      role="tablist"
      className={cn(listVariants({ variant }), className)}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            variant,
          } as any);
        }
        return child;
      })}
    </div>
  );
}

/**
 * Tabs.Trigger - 标签触发器
 */
export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  children: React.ReactNode;
  variant?: "line" | "enclosed" | "soft";
  "data-state"?: string;
}

const triggerVariants = cva(
  "px-4 py-2 text-sm font-medium transition-all duration-250 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        line: "border-b-2 -mb-px rounded-t-lg data-[state=active]:border-primary-500 data-[state=active]:text-primary-600 text-gray-600 hover:text-gray-900 border-transparent",
        enclosed: "rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900",
        soft: "rounded-lg data-[state=active]:bg-primary-50 data-[state=active]:text-primary-700 text-gray-600 hover:text-gray-900 hover:bg-gray-100",
      },
    },
    defaultVariants: {
      variant: "line",
    },
  }
);

export function TabsTrigger({
  value,
  children,
  variant = "line",
  className,
  "data-state": dataState,
  ...props
}: TabsTriggerProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={dataState === "active"}
      data-state={dataState}
      className={cn(triggerVariants({ variant }), className)}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * Tabs.Content - 标签内容
 */
export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children: React.ReactNode;
  "data-state"?: string;
}

export function TabsContent({
  value,
  children,
  className,
  "data-state": dataState,
  ...props
}: TabsContentProps) {
  if (value !== dataState) return null;

  return (
    <div
      role="tabpanel"
      className={cn("mt-4 focus:outline-none", className)}
      tabIndex={0}
      data-state={dataState}
      {...props}
    >
      {children}
    </div>
  );
}
