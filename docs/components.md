# 组件层

两层组件:**设计原语** (`src/design-system/`,CVA 基础组件) 和**业务组件** (`src/components/`,布局/UI/关注系统)。

## 业务组件 `src/components/`

非设计原语,非页面专属组件 (页面专属组件随 page.tsx 放置)。

### 结构

```
components/
├── layout/
│   ├── Navbar.tsx          # Server, 主导航, capability 驱动链接显示
│   ├── NavSession.tsx      # Client, 登录态导航项 (UserLink, MobileMenuSession)
│   ├── MobileMenu.tsx      # Client, 响应式汉堡菜单
│   └── LanguageSettings.tsx # Client, 学习语言/UI 语言切换
├── follow/
│   ├── FollowButton.tsx    # Client, 关注/取关切换
│   ├── FollowStats.tsx     # Client, 粉丝/关注数 + 链接
│   └── UserList.tsx        # Client, 粉丝/关注列表
├── ui/
│   ├── PageLayout.tsx      # Server OK, 居中卡片/全宽/全屏变体
│   ├── PageHeader.tsx      # Server OK, 页面标题 + 副标题
│   ├── CardList.tsx        # Client, 牌组列表 + 收藏切换
│   └── LanguageSelector.tsx # Client, 语言对下拉
├── capability-hydrator.tsx # Client, Server→Client 能力注入 Zustand
├── theme-provider.tsx      # Client, CSS 自定义属性主题上下文 (颜色)
└── density-provider.tsx    # Client, 密度模式上下文 (comfortable/compact)
```

### 查找位置

| 任务 | 位置 | 备注 |
|------|------|------|
| 修改导航栏 | `layout/Navbar.tsx` | Server Component, 需 session 则委托 NavSession |
| 添加登录态 UI | `layout/NavSession.tsx` | 所有依赖 session 的导航项 |
| 关注功能 UI | `follow/` | FollowButton/FollowStats/UserList |
| 页面布局包装 | `ui/PageLayout.tsx` | 三种变体, 多数页面使用 |
| 语言选择 | `ui/LanguageSelector.tsx` | 学习语言对, 非界面语言 |
| 界面语言切换 | `layout/LanguageSettings.tsx` | UI locale (cookie 存储) + 学习语言切换 |
| 能力注入 | `capability-hydrator.tsx` | Server 数据 → Zustand 客户端。详见 [config-system.md](./config-system.md) |
| 主题切换 | `theme-provider.tsx` | CSS 变量 + localStorage |
| 密度切换 | `density-provider.tsx` | comfortable/compact 模式,`<html data-density>` + localStorage |

### 约定

- 导入设计原语: `@/design-system/button`, `@/design-system/card` 等
- Server/Client: Navbar 是 Server, 需交互/状态/hooks 的用 Client
- 页面专属组件 (如 srt-player/components/) 不放此处, 随页面放置
- `capability-hydrator.tsx` 必须在 layout 层渲染, 确保客户端能力状态可用
- `theme-provider.tsx` 提供 CSS 变量上下文, 主题预设定义在 `@/shared/theme-presets`
- `density-provider.tsx` 与 theme-provider 平级, 提供 comfortable/compact 密度切换。`<html data-density="compact">` 触发 `compact:` Tailwind variant + token 覆盖 (见下"密度模式")

---

## 设计系统 `src/design-system/`

基于 CVA 的可复用 UI 组件库。14 个组件文件, 平铺在目录下 (无子目录)。所有组件使用 Lucide React 图标 (非内联 SVG)。

### 组件列表

| 组件                                              | 文件                    | 说明                   |
| ------------------------------------------------- | ----------------------- | ---------------------- |
| Button                                            | `button.tsx`            | 按钮 (primary / light) |
| IconButton                                        | `icon-button.tsx`       | 纯图标按钮 (透明背景)  |
| LinkButton                                        | `link-button.tsx`       | 文字链接按钮           |
| Card, CardBody                                     | `card.tsx`              | 卡片容器               |
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

### Button 变体

只有两种: `primary` (实心主色) 和 `light` (浅灰背景)。

```tsx
<Button variant="primary">主操作</Button>
<Button variant="light">次要操作</Button>
<Button variant="light" selected>选中态</Button>
```

### 导入方式

```tsx
import { Button } from "@/design-system/button";
import { IconButton } from "@/design-system/icon-button";
import { LinkButton } from "@/design-system/link-button";
```

### CVA 使用模式

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

### cn 工具函数

```tsx
import { cn } from "@/utils/cn";
```

### 图标规范

- 使用 Lucide React (`import { X } from "lucide-react"`)
- 禁止内联 `<svg>` (Navbar GithubIcon 是唯一例外)
- 图标按钮使用 `IconButton` 组件, 非 `<button>` + SVG
- 按钮加载状态用 `<Loader2>`, 模态框关闭用 `<X>`, 下拉选择用 `<ChevronDown>`

### 密度模式 (Compact Design System)

项目支持两套密度: **comfortable** (默认, 卡片式) 和 **compact** (高密度, 列表/网格优先)。用户在 `/settings` 切换。

**切换机制** (`density-provider.tsx` + `globals.css`):
- `<html data-density="compact">` 属性切换 (非 inline style)
- localStorage `"density-mode"`, 默认 `"comfortable"`
- `@custom-variant compact` 启用 `compact:` 前缀

**Token 层** (全局自动生效, 零组件迁移) — 在 `[data-density="compact"]` 下覆盖:
- `--spacing`: 0.25rem → 0.1875rem (全站 `p-*`/`gap-*`/`m-*` 按比例收紧 25%)
- `--text-*`: 整体下移一档 (必须同时覆盖 `--text-*` 和 `--text-*--line-height` 对)
- `--radius-*`: 下移一档 (更锐利圆角)
- 覆盖块在 `globals.css` 中为**非分层 CSS** (unlayered), 优先级高于 `@layer theme`

**结构层** (`compact:` variant 逐文件修) — 已应用的页面:

| 文件 | compact: 效果 |
|---|---|
| `ui/CardList.tsx` | 去掉 384px 天花板 (`compact:max-h-none`) |
| `ui/PageLayout.tsx` | 宽度从 max-w-2xl → max-w-7xl |
| `(learn)/explore/ExploreClient.tsx` | 移动端 2 列, XL 6 列, 去截断 |
| `(learn)/decks/DecksClient.tsx` | 行标题 2 行不截断 |
| `(learn)/favorites/FavoritesClient.tsx` | 同上 |
| `(learn)/decks/[deck_id]/CardItem.tsx` | JS substring → CSS truncate, compact 2 行 |
| `(learn)/memorize/MemorizeCard.tsx` | 固定 h-[50dvh] → 内容驱动高度 |
| `(learn)/translator/page.tsx` | 固定 h-64 面板 → 内容驱动高度 |

添加 `compact:` 类时,只增不改 comfortable 行为:
```tsx
<div className="max-h-96 overflow-y-auto compact:max-h-none compact:overflow-visible">
```

### 添加新组件

1. 在 `src/design-system/` 创建 `{name}.tsx`
2. 使用 CVA 定义变体
3. 添加 `"use client"`
4. 导出组件、变体类型
5. 从 `@/utils/cn` 导入 cn
6. 如果有条件样式组合 (如 variant+error), 使用 compoundVariants
7. forwardRef 用于需要 ref 的表单组件 (Input, Select, Textarea, Range)
