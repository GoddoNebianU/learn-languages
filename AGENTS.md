# LEARN-LANGUAGES 知识库

**生成时间:** 2026-03-31
**提交:** dda7d64
**分支:** dev

## 概述

全栈语言学习平台，集成 AI 翻译、词典和 TTS。Next.js 16 App Router + PostgreSQL + better-auth + next-intl。

## 结构

```
src/
├── app/              # Next.js 路由
│   ├── (auth)/       # 认证: login, signup, profile, users/[username], forgot/reset-password
│   ├── (features)/   # 功能: translator, dictionary, srt-player, text-speaker, alphabet, explore, favorites
│   ├── decks/        # 牌组管理 (不在路由组内)
│   ├── settings/     # 设置页面
│   └── api/auth/     # better-auth catch-all (唯一 API 路由)
├── modules/          # 业务逻辑 (action-service-repository)
│   ├── auth/         # 认证 (12 文件: auth + forgot-password 两个子域)
│   ├── card/         # 卡片 CRUD
│   ├── deck/         # 牌组管理 (最复杂模块, 12 actions)
│   ├── follow/       # 用户关注系统
│   ├── dictionary/   # 词典 (不完整: 仅 action, 无 repo — AI 驱动)
│   ├── translator/   # 翻译 (不完整: 无 repo — AI 驱动)
│   └── shared/       # 跨模块工具 (action-utils.ts)
├── design-system/    # CVA 基础组件 (与 components/ 分离)
│   ├── base/         # button, input, card, checkbox, radio, switch, select, textarea, range
│   ├── feedback/     # alert, progress, skeleton, toast
│   ├── layout/       # container, grid, stack
│   ├── overlay/      # modal, overflow-dropdown
│   ├── data-display/ # badge, divider
│   └── navigation/   # tabs
├── components/       # 业务组件 (非通用 UI)
│   ├── layout/       # Navbar, MobileMenu, LanguageSettings
│   ├── follow/       # FollowButton, FollowStats, UserList
│   └── ui/           # PageLayout, PageHeader, CardList, LocaleSelector
├── lib/              # 集成层
│   ├── bigmodel/     # AI 管道 (llm, tts, translator, dictionary, ocr)
│   ├── browser/      # 客户端工具 (localStorage)
│   ├── logger/       # Winston 日志
│   └── theme/        # 主题颜色
├── hooks/            # useAudioPlayer, useFileUpload
├── utils/            # cn, validate, json, string, random
├── shared/           # card-type, dictionary-type, translator-type, theme-presets, constant
├── config/           # i18n, images
└── i18n/             # next-intl 请求配置

非 src: prisma/ (Schema+迁移), messages/ (i18n 翻译 8 种语言), public/alphabets/ (字母 JSON), public/fonts/ (维吾尔语字体), scripts/ (开发工具)
```

## 查找位置

| 任务 | 位置 | 备注 |
|------|------|------|
| 添加功能页面 | `src/app/(features)/` | 路由组，无 URL 前缀 |
| 添加认证页面 | `src/app/(auth)/` | 登录、注册、个人资料 |
| 添加牌组页面 | `src/app/decks/` | 不在路由组内 |
| 添加业务逻辑 | `src/modules/{name}/` | 遵循 action-service-repository |
| 添加 AI 管道 | `src/lib/bigmodel/{name}/` | 多阶段 orchestrator |
| 添加 OCR 功能 | `src/lib/bigmodel/ocr/` | 视觉模型提取词汇表 (目前未使用) |
| 添加 UI 组件 | `src/design-system/{category}/` | base, feedback, layout, overlay |
| 添加工具函数 | `src/utils/` | 纯函数 |
| 添加类型定义 | `src/shared/` | 业务类型 |
| 跨模块工具 | `src/modules/shared/` | getCurrentUserId, requireAuth |
| 字母学习 | `src/app/(features)/alphabet/` | 静态 JSON 数据 |
| 数据库查询 | `src/modules/*/` | Repository 层 |
| i18n 翻译 | `messages/*.json` | 8 种语言 |

## 约定

### 架构: Action-Service-Repository
每个模块 6 个文件: `{name}-{action|action-dto|service|service-dto|repository|repository-dto}.ts`

### 命名
- 类型: `{Layer}{Input|Output}{Feature}` → `ActionInputSignUp`
- 函数: `{layer}{Feature}` → `actionSignUp`, `serviceSignUp`
- 文件: `kebab-case` 带角色后缀

### Server/Client 划分
- **默认**: Server Components (无 "use client")
- **Client**: 仅在需要时 (useState, useEffect, 浏览器 API)
- **Actions**: 必须有 `"use server"`

### 导入风格
- 显式路径: `@/design-system/base/button` (无 barrel exports)
- 不创建 `index.ts` 文件

### 验证
- Zod schemas 放在 `*-dto.ts`，使用 `validate()` from `@/utils/validate`
- Zod v4 默认导入: `import z from "zod"`
- DTO 三件套: `schema` + `type` (z.infer) + `validate` (generateValidator)

### 认证
```typescript
// 服务端
import { auth } from "@/auth";
const session = await auth.api.getSession({ headers: await headers() });
// 客户端
import { authClient } from "@/lib/auth-client";
const { data } = authClient.useSession();
```

### 受保护操作
```typescript
const session = await auth.api.getSession({ headers: await headers() });
if (!session?.user?.id) return { success: false, message: "未授权" };
// 变更前检查所有权
```

### 日志
```typescript
import { createLogger } from "@/lib/logger";
const log = createLogger("module-name");
log.info("description", { count: items.length });
```

### Action 返回格式
所有 action 统一返回: `{ success: boolean; message: string; data?: T }`

### Server→Client 数据传递
```typescript
// page.tsx (Server) 获取数据 → 传给 Client 组件
export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) redirect("/login");
  const data = await actionGetData();
  return <ClientComponent initialData={data} />;
}
```

### i18n 翻译检查
**注意：翻译缺失不会被 build 检测出来。**

**系统性检查翻译缺失的方法（改进版）：**

#### 步骤 1: 使用 AST-grep 搜索所有翻译模式

```bash
# 搜索所有 useTranslations 和 getTranslations 声明
ast-grep --pattern 'useTranslations($ARG)' --lang tsx --paths src/

# 搜索所有带插值的 t() 调用
ast-grep --pattern 't($ARG, $OPTS)' --lang tsx --paths src/

# 搜索所有简单 t() 调用
ast-grep --pattern 't($ARG)' --lang tsx --paths src/
```

**AST-grep 能捕获 31 种不同的翻译键模式， 而 grep 只能捕获 1 种模式。**

#### 步骤 2: 按文件提取所有翻译键

逐个 `.tsx` 文件检查使用的翻译键：
1. 找到该文件使用的 namespace（`useTranslations("namespace")` 或 `getTranslations("namespace")`）
2. 提取该文件中所有 `t("...")` 调用
3. 注意动态键模式：
   - 模板字面量: `t(\`prefix.${variable}\`)` 
   - 条件键: `t(condition ? "a" : "b")`
   - 变量键: `t(variable)` 
4. 对比 `messages/en-US.json`，找出缺失的键

5. 先补全 `en-US.json`（作为基准语言）
6. 再根据 `en-US.json` 补全其他 7 种语言

#### 步骤 3: 验证 JSON 文件结构
**注意：JSON 语法错误会导致 build 失败，常见错误：**
- 重复的键（同一对象中出现两次相同的键名）
- 缺少逗号或多余的逗号
- 缺少闭合括号 `}`

```bash
# 验证 JSON 格式
node -e "console.log(JSON.parse(require('fs').readFileSync('messages/en-US.json', 'utf8')))"
```

#### 步骤 4: 对比验证
```bash
# 列出代码中使用的所有 namespace
ast-grep --pattern 'useTranslations($ARG)' --lang tsx --paths src/ | grep -o 'useTranslations\|getTranslations' | sort | uniq

# 对比 messages/en-US.json 中的 namespace 列表
node -e "console.log(Object.keys(JSON.parse(require('fs').readFileSync('messages/en-US.json', 'utf8'))).join('\n'))"
```

## 反模式 (本项目)

- ❌ `index.ts` barrel exports (例外: `src/lib/logger/index.ts` 内部模块, `src/components/ui/index.ts` 遗留兼容)
- ❌ `as any`, `@ts-ignore`, `@ts-expect-error`
- ❌ 用 API routes 做数据操作 (使用 Server Actions, 唯一 API 路由是 better-auth)
- ❌ Server Component 可行时用 Client Component
- ❌ npm 或 yarn (使用 pnpm)
- ❌ 生产代码中使用 `console.log` (使用 winston logger, 客户端组件例外)
- ❌ 擅自运行 `pnpm dev` (不需要，用 `pnpm build` 验证即可)
- ❌ `db push` (必须用 `prisma migrate dev`)
- ❌ 在 repo 层外直接使用 prisma (例外: `src/auth.ts` better-auth hooks)

## 独特风格

### 设计系统分类
- `base/` — 原子组件: button, input, card, checkbox, radio, switch, select, textarea, range
- `feedback/` — 反馈: alert, progress, skeleton, toast
- `layout/` — 布局: container, grid, stack (VStack, HStack)
- `overlay/` — 覆盖层: modal, overflow-dropdown
- `data-display/` — 数据展示: badge, divider
- `navigation/` — 导航: tabs

### AI 管道模式
`src/lib/bigmodel/` 多阶段 orchestrator: `orchestrator.ts` + `types.ts` + `stage{n}-{name}.ts`

现有管道:
| 管道 | 阶段数 | LLM 调用 | 用途 |
|------|--------|---------|------|
| dictionary | 2 | 2 | 词典查询 (stage1-preprocess + stage4-entriesGeneration) |
| translator | 3 | 2-4 | 翻译 (语言检测→翻译→可选IPA) |
| ocr | 1 | 1 | 图片词汇提取 (GLM-4.6V, 目前未使用) |
| tts | - | - | 阿里云千问 TTS (非管道, 直接调用) |

共享依赖: `llm.ts` (Zhipu AI 客户端), `tts.ts` (Qwen TTS 服务), `@/utils/json` (AI JSON 解析)

## 命令

```bash
pnpm dev           # 开发服务器 (HTTPS)
pnpm build         # 生产构建 (验证代码)
pnpm lint          # ESLint
pnpm prisma studio # 数据库 GUI
```

### 数据库迁移
**必须使用 `prisma migrate dev`，禁止 `db push`：**
```bash
DATABASE_URL=your_db_url pnpm prisma migrate dev --name your_migration_name
DATABASE_URL=your_db_url pnpm prisma generate
```

## 备注

- Tailwind CSS v4 (无 tailwind.config.ts, 通过 `@tailwindcss/postcss` + `globals.css` 的 `@theme` 指令)
- React Compiler 已启用 (next.config.ts: reactCompiler: true)
- Zod v4 (默认导入 `import z from "zod"`)
- i18n: 8 种语言, cookie 存储 locale (无 URL 路径, 无 middleware)
- Prisma 7: `prisma-client` 生成器 (非 `prisma-client-js`), 输出到 `generated/prisma/`, 使用 PrismaPg adapter
- TTS: 阿里云千问 (qwen3-tts-flash)
- 数据库: PostgreSQL, 必须用 `prisma migrate dev`
- 未配置测试基础设施, 用 `pnpm build` 验证
- Docker: 3 阶段构建 (deps → builder → runner), standalone 输出, Node 24 Alpine
- 无 CI/CD 管道 (手动构建)
- 无 middleware.ts, 无 error.tsx, 无 loading.tsx
- 主题: CSS 自定义属性 + localStorage (15 个预设主题)
- `"use server"` 也用于 AI 工具文件 (llm.ts, tts.ts), 不仅限于 action 文件
- 翻译缺失不会被 build 检测 — 用 AST-grep 手动审计
- translator-action.ts 中 genIPA() 和 genLanguage() 已废弃但保留用于 text-speaker 兼容
