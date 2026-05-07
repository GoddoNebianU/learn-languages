# LEARN-LANGUAGES 知识库

**生成时间:** 2026-05-07
**提交:** 1fda9fb
**分支:** main

## 概述

全栈语言学习平台，集成 AI 翻译、词典和 TTS。Next.js 16 App Router + PostgreSQL + better-auth + next-intl。

## 结构

```
src/
├── app/              # Next.js 路由 (25 pages, 1 API route, 单一根 layout)
│   ├── (auth)/       # 认证: login, signup, logout, forgot/reset-password, users/[username]
│   ├── (account)/    # 账户: profile, settings
│   ├── (learn)/      # 功能: translator, dictionary, srt-player, text-speaker, alphabet, explore, favorites, decks, memorize
│   │   └── srt-player/ # 最复杂页面: 自含 components/, hooks/, stores/, utils/
│   │   └── memorize/  # 记忆模式: ?deck_id=xxx 查询参数, 无参数跳转 /decks
│   ├── error.tsx     # 根级错误边界
│   ├── not-found.tsx # 404 页面
│   └── api/auth/     # better-auth catch-all (唯一 API 路由)
├── modules/          # 业务逻辑 (action-service-repository)
│   ├── auth/         # 认证 (12 文件: auth + forgot-password 两个子域)
│   ├── card/         # 卡片 (5 文件, 缺 card-service-dto)
│   ├── deck/         # 牌组管理 (最复杂模块, 12 actions, 310 行 repo)
│   ├── follow/       # 用户关注系统
│   ├── dictionary/   # 词典 (不完整: 仅 action+action-dto+service-dto — AI 驱动, 无 repo)
│   ├── translator/   # 翻译 (不完整: 无 repo — AI 驱动, 含废弃函数 genIPA/genLanguage)
│   └── shared/       # 跨模块工具 (action-utils.ts: getCurrentUserId, requireAuth)
├── design-system/    # CVA 基础组件 (平铺 14 文件, 无子目录, 与 components/ 分离)
│   # button, icon-button, link-button, card, input, select, textarea, range, progress,
│   # skeleton, stack, container, modal, overflow-dropdown
├── components/       # 业务组件 (非通用 UI)
│   ├── layout/       # Navbar, NavSession, MobileMenu, LanguageSettings
│   ├── follow/       # FollowButton, FollowStats, UserList
│   └── ui/           # PageLayout, PageHeader, CardList, LanguageSelector, LocaleSelector
├── lib/              # 集成层
│   ├── auth-mode.ts  # 单/多用户模式切换 (isSingleUserMode, getSingleUserId)
│   ├── bigmodel/     # AI 管道 (llm, tts, translator, dictionary, ocr) — 详见子级 AGENTS.md
│   ├── browser/      # 客户端工具 (localStorage)
│   ├── logger/       # Winston 日志 (index.ts barrel — 唯一允许的 barrel export)
│   └── theme/        # 主题颜色
├── hooks/            # useAudioPlayer, useFileUpload
├── utils/            # cn, validate, json, string, random
├── shared/           # card-type, dictionary-type, translator-type, languages, theme-presets, constant
├── config/           # i18n, images
└── i18n/             # next-intl 请求配置 (request.ts)

非 src: prisma/ (Schema+4 迁移), messages/ (i18n 翻译 8 种语言), public/alphabets/ (字母 JSON), public/fonts/ (维吾尔语字体)
```

## 查找位置

| 任务          | 位置                            | 备注                            |
| ------------- | ------------------------------- | ------------------------------- |
| 添加功能页面  | `src/app/(learn)/`              | 路由组，无 URL 前缀             |
| 添加认证页面  | `src/app/(auth)/`               | 登录、注册、找回密码            |
| 添加账户页面  | `src/app/(account)/`            | 个人资料、设置                  |
| 添加牌组页面  | `src/app/(learn)/decks/`        | 在 (learn) 路由组内             |
| 添加记忆页面  | `src/app/(learn)/memorize/`     | ?deck_id=xxx, 无参数跳转 /decks |
| 添加业务逻辑  | `src/modules/{name}/`           | 遵循 action-service-repository  |
| 添加 AI 管道  | `src/lib/bigmodel/{name}/`      | 多阶段 orchestrator             |
| 添加 OCR 功能 | `src/lib/bigmodel/ocr/`         | 视觉模型提取词汇表 (目前未使用) |
| 添加 UI 组件  | `src/design-system/`            | 平铺文件, 无子目录, 使用 CVA    |
| 添加工具函数  | `src/utils/`                    | 纯函数                          |
| 添加类型定义  | `src/shared/`                   | 业务类型                        |
| 跨模块工具    | `src/modules/shared/`           | getCurrentUserId, requireAuth   |
| 字母学习      | `src/app/(learn)/alphabet/`     | 静态 JSON 数据                  |
| 数据库查询    | `src/modules/*/`                | Repository 层                   |
| i18n 翻译     | `messages/*.json`               | 8 种语言                        |

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

- 显式路径: `@/design-system/button` (无 barrel exports)
- 不创建 `index.ts` 文件

### 验证

- Zod schemas 放在 `*-dto.ts`，使用 `validate()` from `@/utils/validate`
- Zod v4 默认导入: `import z from "zod"`
- DTO 三件套: `schema` + `type` (z.infer) + `validate` (generateValidator)

### 认证

**环境变量**: `NEXT_PUBLIC_AUTH_MODE=multi|single` (默认 `multi`)

#### 多用户模式 (multi)

```typescript
// 服务端: 通过 getCurrentUserId (推荐)
import { getCurrentUserId } from "@/modules/shared/action-utils";
const userId = await getCurrentUserId();
// 或直接使用 auth (仅 Navbar/profile 等需要 session 对象的场景)
import { auth } from "@/auth";
const session = await auth.api.getSession({ headers: await headers() });

// 客户端
import { authClient } from "@/lib/auth-client";
const { data } = authClient.useSession();
```

#### 单用户模式 (single)

- `src/lib/auth-mode.ts`: `isSingleUserMode()` + `getSingleUserId()` (自动创建 admin 用户)
- `getCurrentUserId()` 在单用户模式下直接返回 admin ID，不调用 better-auth
- 认证页面 (login/signup 等) → `notFound()`
- 用户资料页 (/users/*) → `notFound()`
- API 路由 (/api/auth/*) → 404
- Navbar 始终显示已登录状态，UserLink 指向 /settings
- 客户端组件通过 `process.env.NEXT_PUBLIC_AUTH_MODE === "single"` 检测

### 邮箱验证流程

- `src/auth.ts` 配置: `requireEmailVerification: true`, `sendOnSignUp: true`, `autoSignInAfterVerification: true`
- 注册后自动发验证邮件, 验证后自动登录
- 未验证用户登录 → 403 + 提示 (email 登录显示重发按钮, username 登录仅提示)
- `sendOnSignIn` 已禁用, 防止邮件轰炸; 用户需手动点重发

### 受保护操作

```typescript
// 推荐: 使用 shared 工具 (自动适配单/多用户模式)
import { getCurrentUserId } from "@/modules/shared/action-utils";
const userId = await getCurrentUserId();
if (!userId) return { success: false, message: "未授权" };
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
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
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
- ❌ 原生 `confirm()` / `prompt()` / `alert()` (使用 design-system/modal)
- ❌ 内联 SVG 图标 (使用 Lucide React, 例外: Navbar 的 GithubIcon)

## 独特风格

### 设计系统

平铺 14 文件在 `src/design-system/`，无子目录，全部使用 CVA + `"use client"`。
- button (primary/light 变体), icon-button, link-button, card (compound), input, select, textarea, range
- progress, skeleton
- VStack/HStack (stack), container
- modal (compound), overflow-dropdown
- 所有 SVG 图标使用 Lucide React (唯一例外: Navbar 的 GithubIcon)

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
pnpm dev           # 开发服务器
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
- 无 CI/CD 管道 (手动构建)
- 无 middleware.ts, 无 loading.tsx (error.tsx 存在于根级)
- 主题: CSS 自定义属性 + localStorage (15 个预设主题)
- `"use server"` 也用于 AI 工具文件 (llm.ts, tts.ts), 不仅限于 action 文件
- translator-action.ts 中 genIPA() 和 genLanguage() 已废弃但保留用于 text-speaker 兼容
- 所有 8 种语言翻译 key 必须完全一致 (用 `node -e` 脚本对比 en-US 与其他语言)
- 单/多用户模式: `NEXT_PUBLIC_AUTH_MODE=single` 跳过 better-auth，自动创建 admin 用户 (详见 src/lib/auth-mode.ts)
