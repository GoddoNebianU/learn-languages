# 设计系统指南

## 概述

基于 CVA 的可复用 UI 组件库, 与业务组件 (`src/components/`) 分离。14 个组件文件, 平铺在 `src/design-system/` 目录下。

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

## cn 工具函数

```tsx
import { cn } from "@/utils/cn";
```

## 添加新组件

1. 在 `src/design-system/` 创建 `{name}.tsx`
2. 使用 CVA 定义变体
3. 添加 `"use client"`
4. 导出组件、变体类型
5. 从 `@/utils/cn` 导入 cn
