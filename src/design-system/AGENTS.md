# 设计系统指南

**生成时间:** 2026-05-09

## 概述

基于 CVA 的可复用 UI 组件库, 与业务组件 (`src/components/`) 分离。14 个组件文件, 平铺在 `src/design-system/` 目录下 (无子目录)。

所有组件使用 Lucide React 图标 (非内联 SVG)。按钮加载状态用 `<Loader2>`, 模态框关闭用 `<X>`, 下拉选择用 `<ChevronDown>`。唯一例外: Navbar 的 GithubIcon 保持内联 SVG。

## 组件列表

| 组件                                              | 文件                    | 说明                   |
| ------------------------------------------------- | ----------------------- | ---------------------- |
| Button                                            | `button.tsx`            | 按钮 (primary / light) |
| IconButton                                        | `icon-button.tsx`       | 纯图标按钮 (透明背景)  |
| LinkButton                                        | `link-button.tsx`       | 文字链接按钮           |
| Card, CardHeader, CardTitle, CardBody, CardFooter | `card.tsx`              | 卡片容器               |
| Input                                             | `input.tsx`             | 输入框                 |
| Select                                            | `select.tsx`            | 下拉选择               |
| Textarea                                          | `textarea.tsx`          | 多行文本               |
| Range                                             | `range.tsx`             | 范围滑块               |
| Progress                                          | `progress.tsx`          | 进度条                 |
| Skeleton                                          | `skeleton.tsx`          | 骨架屏                 |
| VStack, HStack                                    | `stack.tsx`             | 堆叠布局               |
| Container                                         | `container.tsx`         | 容器                   |
| Modal                                             | `modal.tsx`             | 模态框                 |
| OverflowDropdown                                  | `overflow-dropdown.tsx` | 溢出下拉               |

## Button 变体

只有两种: `primary` (实心主色) 和 `light` (浅灰背景)。

```tsx
<Button variant="primary">主操作</Button>
<Button variant="light">次要操作</Button>
<Button variant="light" selected>选中态</Button>
```

## 导入方式

```tsx
import { Button } from "@/design-system/button";
import { IconButton } from "@/design-system/icon-button";
import { LinkButton } from "@/design-system/link-button";
```

## CVA 使用模式

10/14 组件使用 CVA (button, card, input, select, textarea, range, progress, skeleton, stack, container)。4 个不使用: icon-button, link-button, modal, overflow-dropdown。

```tsx
// 标准模式
const componentVariants = cva("base-classes", {
  variants: { variant: { ... }, size: { ... } },
  compoundVariants: [{ variant: "filled", error: true, className: "..." }],
  defaultVariants: { variant: "default", size: "md" },
});
// 类型导出
export type Variant = VariantProps<typeof componentVariants>["variant"];
// 组件内使用
className={cn(componentVariants({ variant, size }), className)}
```

compoundVariants 用于: input (filled+error), select (filled+error, filled+size), textarea (filled+error)。

## cn 工具函数

```tsx
import { cn } from "@/utils/cn";
```

## 图标规范

- 使用 Lucide React (`import { X } from "lucide-react"`)
- 禁止内联 `<svg>` (Navbar GithubIcon 是唯一例外)
- 图标按钮使用 `IconButton` 组件, 非 `<button>` + SVG

## 添加新组件

1. 在 `src/design-system/` 创建 `{name}.tsx`
2. 使用 CVA 定义变体
3. 添加 `"use client"`
4. 导出组件、变体类型
5. 从 `@/utils/cn` 导入 cn
6. 如果有条件样式组合 (如 variant+error), 使用 compoundVariants
7. forwardRef 用于需要 ref 的表单组件 (Input, Select, Textarea, Range)
