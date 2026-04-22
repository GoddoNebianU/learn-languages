# 设计系统指南

## 概述

基于 CVA 的可复用 UI 组件库, 与业务组件 (`src/components/`) 分离。12 个组件文件, 平铺在 `src/design-system/` 目录下。

## 组件列表

| 组件 | 文件 | 说明 |
|------|------|------|
| Button, CircleButton, CircleToggleButton, IconClick | `button.tsx` | 按钮及变体 |
| Card, CardHeader, CardTitle, CardBody, CardFooter | `card.tsx` | 卡片容器 |
| Input | `input.tsx` | 输入框 |
| Select | `select.tsx` | 下拉选择 |
| Textarea | `textarea.tsx` | 多行文本 |
| Range | `range.tsx` | 范围滑块 |
| Progress | `progress.tsx` | 进度条 |
| Skeleton | `skeleton.tsx` | 骨架屏 |
| VStack, HStack | `stack.tsx` | 堆叠布局 |
| Container | `container.tsx` | 容器 |
| Modal | `modal.tsx` | 模态框 |
| OverflowDropdown | `overflow-dropdown.tsx` | 溢出下拉 |

## 使用频率

**高频** (5+ 文件): Button (25), VStack/HStack (14), Input (8), Skeleton (5), Card (5)
**中频** (2-4): Select (4), Textarea (4), Modal (3), Container (2)
**低频** (1): Progress, Range, OverflowDropdown

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

## 导入方式

```tsx
// ✅ 直接从 design-system 导入 (项目标准)
import { Button } from "@/design-system/button";
import { Card, CardHeader, CardTitle, CardBody } from "@/design-system/card";
// ❌ 不要从 barrel 导入
```

## cn 工具函数

```tsx
// ✅ 使用项目级 cn
import { cn } from "@/utils/cn";
```

## 添加新组件

1. 在 `src/design-system/` 创建 `{name}.tsx`
2. 使用 CVA 定义变体
3. 添加 `"use client"`
4. 导出组件、变体类型
5. 从 `@/utils/cn` 导入 cn
