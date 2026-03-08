# 设计系统指南

**生成时间:** 2026-03-08

## 概述

基于 CVA 的可复用 UI 组件库，与业务组件分离。

## 组件分类

| 类别 | 路径 | 组件 |
|------|------|------|
| 基础 | `base/` | button, input, card, checkbox, radio, switch, select, textarea, range |
| 反馈 | `feedback/` | alert, progress, skeleton, toast |
| 布局 | `layout/` | container, grid, stack (VStack, HStack) |
| 覆盖层 | `overlay/` | modal |
| 导航 | `navigation/` | tabs |

## CVA 模式

```tsx
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva("base-styles", {
  variants: {
    variant: { primary: "...", secondary: "...", ghost: "..." },
    size: { sm: "...", md: "...", lg: "..." },
  },
  defaultVariants: { variant: "secondary", size: "md" },
});

export type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];
```

## 组件模板

```tsx
"use client";
import { forwardRef } from "react";
import { cn } from "@/design-system/lib/utils";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, leftIcon, rightIcon, children, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props}>
      {leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  )
);
Button.displayName = "Button";
export const PrimaryButton = (props: Omit<ButtonProps, "variant">) => <Button variant="primary" {...props} />;
```

## 复合组件

```tsx
<Card variant="bordered"><CardHeader><CardTitle>标题</CardTitle></CardHeader><CardBody>内容</CardBody></Card>
<Modal open={isOpen}><Modal.Header><Modal.Title>标题</Modal.Title></Modal.Header><Modal.Body>内容</Modal.Body></Modal>
```

## 导入方式

```tsx
// ✅ 显式导入
import { Button } from "@/design-system/base/button";
import { Card, CardHeader, CardTitle, CardBody } from "@/design-system/base/card";
// ❌ 不要创建 barrel export
```

## 工具函数

```tsx
import { cn } from "@/design-system/lib/utils";
<div className={cn("base", condition && "conditional", className)} />
```

## 添加新组件

1. 确定类别目录
2. 创建 `{name}.tsx`，使用 CVA 定义变体
3. 添加 `"use client"` + `forwardRef` + `displayName`
4. 导出组件、变体类型、快捷组件
