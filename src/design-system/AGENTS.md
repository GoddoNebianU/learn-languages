# 设计系统指南

**生成时间:** 2026-03-31

## 概述

基于 CVA 的可复用 UI 组件库, 与业务组件 (`src/components/`) 分离。21 个组件文件。

## 组件分类

| 类别 | 路径 | 组件 |
|------|------|------|
| 基础 | `base/` | button, input, card, checkbox, radio, switch, select, textarea, range |
| 反馈 | `feedback/` | alert, progress, skeleton, toast |
| 布局 | `layout/` | container, grid, stack (VStack, HStack) |
| 覆盖层 | `overlay/` | modal, overflow-dropdown |
| 数据展示 | `data-display/` | badge, divider |
| 导航 | `navigation/` | tabs |

## 使用频率

**高频** (5+ 文件): Button (25), VStack/HStack (14), Input (8), Skeleton (5), Card (5)
**中频** (2-4): Select (4), Textarea (4), Modal (3), Container (2)
**低频** (1): Progress, Range, OverflowDropdown
**未使用**: Checkbox, Radio, Switch, Alert, Tabs, Badge, Divider, Grid, Toast (设计系统封装)

**注意**: Toast 设计系统封装零使用 — 所有 21 个消费者直接 `import { toast } from "sonner"`。

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

不用 CVA 的组件: Range, Grid (手动 className), Modal, OverflowDropdown, Toast (sonner 封装)

## 组件模板

```tsx
"use client";
import { forwardRef } from "react";
import { cn } from "@/utils/cn";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, children, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props}>
      {children}
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
<Tabs value={v} onValueChange={set}><Tabs.List><Tabs.Trigger value="a">A</Tabs.Trigger></Tabs.List><Tabs.Content value="a">...</Tabs.Content></Tabs>
```

## 导入方式

```tsx
// ✅ 显式导入 (项目标准)
import { Button } from "@/design-system/base/button";
import { Card, CardHeader, CardTitle, CardBody } from "@/design-system/base/card";
// ❌ 不要从 barrel 导入
```

## cn 工具函数

```tsx
// ✅ 正确: 使用项目级 cn
import { cn } from "@/utils/cn";
// ⚠️ 存在但不要使用: @/design-system/lib/utils (重复实现)
```

## 添加新组件

1. 确定类别目录
2. 创建 `{name}.tsx`, 使用 CVA 定义变体
3. 添加 `"use client"` + `forwardRef` + `displayName`
4. 导出组件、变体类型、快捷组件
5. 从 `@/utils/cn` 导入 cn
