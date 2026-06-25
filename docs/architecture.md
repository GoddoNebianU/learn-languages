# 架构总览

全栈语言学习平台,集成 AI 翻译、词典和 TTS。Next.js 16 App Router + PostgreSQL + better-auth + next-intl。

## 目录结构

```
src/
├── app/              # Next.js 路由 (25 pages, 1 API route, 单一根 layout)
│   ├── (auth)/       # 认证: login, signup, logout, forgot/reset-password, users/[username]
│   ├── (account)/    # 账户: profile, settings
│   ├── (learn)/      # 功能: translator, dictionary, srt-player, text-speaker, alphabet, explore, favorites, decks, memorize, reading
│   ├── admin/        # 管理后台: 独立认证, 功能开关/services 配置 + 用户管理 (users/ 子路由)
│   ├── error.tsx     # 根级错误边界 (生产环境隐藏 error.message)
│   ├── not-found.tsx
│   └── api/auth/     # better-auth catch-all (唯一 API 路由)
├── modules/          # 业务逻辑 (action-service-repository)
├── design-system/    # CVA 基础组件 (15 文件, 平铺, 纯展示组件无需 "use client")
├── components/       # 业务组件 (layout/follow/ui + capability-hydrator + theme-provider + density-provider)
├── lib/              # 集成层 (env/db/auth/capability/providers/bigmodel/email/logger/browser/theme)
│   ├── providers/    # 外部 API 对接统一层 (llm/tts/smtp), 对外暴露统一接口
│   └── bigmodel/     # AI 管道编排 (orchestrator/types); LLM/TTS 集成已移至 providers/
├── shared/           # card-type, dictionary-type, translator-type, languages, theme-presets
├── utils/            # cn, validate, json, string
├── hooks/            # useAudioPlayer
├── config/           # i18n, images
└── i18n/             # next-intl 请求配置

非 src: prisma/ (Schema, 使用 db push), messages/ (9 种语言), public/alphabets/, public/fonts/
```

> 页面路由、渲染模式详见 [pages.md](./pages.md);功能页详解见 [features.md](./features.md);管理后台见 [config-system.md](./config-system.md);密度模式 (comfortable/compact) 详见 [components.md](./components.md#密度模式-compact-design-system)。

## 查找位置

| 任务          | 位置                        | 备注                            |
| ------------- | --------------------------- | ------------------------------- |
| 添加功能页面  | `src/app/(learn)/`          | 路由组,无 URL 前缀             |
| 添加认证页面  | `src/app/(auth)/`           | 登录、注册、找回密码            |
| 添加业务逻辑  | `src/modules/{name}/`       | 遵循 action-service-repository  |
| 添加 AI 管道  | `src/lib/bigmodel/{name}/`  | 多阶段 orchestrator             |
| 对接外部 API (LLM/TTS/SMTP) | `src/lib/providers/` | 统一接口层, bigmodel 调用 |
| 管理后台配置  | `src/app/admin/`            | 独立认证, 功能开关/services 管理 |
| 添加 UI 组件  | `src/design-system/`        | 平铺文件, CVA                   |
| 添加工具函数  | `src/utils/`                | 纯函数                          |
| 数据库查询    | `src/modules/*/`            | Repository 层                   |
| i18n 翻译     | `messages/*.json`           | 9 种语言                        |
| 能力查询      | `src/lib/capability.ts`     | hasCapability, getServices 等   |

## 模块架构: Action-Service-Repository

业务模块采用三层架构。10 个模块 + 1 个共享工具。每个模块最多 6 个文件:

```
{name}/
├── {name}-action.ts       # Server Actions, "use server"
├── {name}-action-dto.ts   # Zod schemas + 类型 + validate 函数
├── {name}-service.ts      # 业务逻辑, 跨模块调用
├── {name}-service-dto.ts  # Service 类型 (纯 TS, 无 Zod)
├── {name}-repository.ts   # Prisma 查询
└── {name}-repository-dto.ts # Repository 类型
```

AI 驱动模块 (dictionary, translator, reading) 跳过 repository 层。

横切模块 `activity` 跳过 action/action-dto 层 — 它只对外暴露 `logActivity()` 供其他 action 调用做审计日志,本身没有面向用户的入口。

### 模块清单

| 模块       | 文件数 | Actions | 模式完整性         | 备注                              |
| ---------- | ------ | ------- | ------------------ | --------------------------------- |
| auth       | 12     | 3+1     | 完整 (两个子域)    | auth + forgot-password 各 6 文件; signUp/signIn/signOut 由客户端直接调用 authClient; signOutAction 仅用于 logout 页面 |
| deck       | 6      | 14      | 完整               | 最复杂模块, 386 行 repository     |
| card       | 6      | 9       | 完整               | 跨模块依赖 deck, hidden 字段      |
| follow     | 6      | 4       | 完整               | 自包含, 无外部依赖                |
| dictionary | 3      | 1       | 不完整             | 无 service/repo — AI 管道直接调用 |
| translator | 4      | 3       | 不完整             | 无 repo — AI 管道, genIPA/genLanguage 有 try/catch, 失败返回空字符串 |
| reading    | 4      | 1       | 不完整             | 无 repo — AI 管道 (翻译拆句+分词对齐) |
| shared     | 1      | 0       | N/A                | getCurrentUserId                   |
| admin      | 2      | 0       | service+repository only | admin-action.ts 在 app/admin/ 调用, 无独立 action 文件 |
| activity   | 3      | 0       | 不完整 (横切)      | constants + repository + service; 无 action 层; `logActivity()` 被所有 action + better-auth databaseHooks + api/tts 调用做审计 |

### 不完整模块说明

- **dictionary (3 文件)**: 有 action + action-dto + service-dto,无 service/repository/repository-dto。纯 AI 查询,无数据库持久化。action 直接调用 `@/lib/bigmodel/dictionary/orchestrator`
- **translator (4 文件)**: 有 action + action-dto + service + service-dto,无 repository/repository-dto。翻译通过 AI 管道。genIPA()/genLanguage() 失败返回空字符串 (用于 text-speaker 兼容)
- **reading (4 文件)**: 有 action + action-dto + service + service-dto,无 repository/repository-dto。service 直接调用 `@/lib/bigmodel/reading/orchestrator`
- **admin (2 文件)**: admin-repository.ts + admin-service.ts,无 action/action-dto/service-dto/repository-dto。action 在 `app/admin/` 页面中直接调用 service
- **activity (3 文件)**: activity-constants.ts + activity-repository.ts + activity-service.ts,无 action/action-dto。横切审计模块。`logActivity(params)` 自动从请求头解析 IP/User-Agent (解析失败不阻断写入),支持 `ip`/`userAgent` 覆盖参数 (better-auth DB hook 已捕获 session.ipAddress/userAgent 时用)。内部所有错误被吞,**绝不影响主操作**。记录点: auth (signup/login via databaseHooks, logout/delete/reset)、deck/card CRUD、dictionary/translator/reading 查询、tts 合成、follow、admin 配置/用户管理。schema 见 `ActivityLog` 模型 (userId? SetNull,action/entityType?/entityId?/ip?/userAgent?/metadata?/createdAt,索引 userId/action/createdAt)。

### 跨模块依赖

```
card-service ──> deck-repository (repoGetUserIdByDeckId 用于所有权检查)
admin-service ──> capability (invalidateCapabilityCache)
所有 action + auth.ts (databaseHooks) + api/tts/route ──> activity-service (logActivity 审计)
```

其余模块完全自包含。

### 命名约定

```typescript
// 类型: {Layer}{Input|Output}{Feature}
type ActionInputCreateDeck = { ... };
type RepoOutputDeck = { ... };

// 函数: {layer}{Feature}
async function actionCreateDeck(input: unknown): Promise<ActionOutputCreateDeck>
async function serviceCreateDeck(input: ServiceInputCreateDeck): Promise<ServiceOutputCreateDeck>
async function repoCreateDeck(input: RepoInputCreateDeck): Promise<RepoOutputDeck>

// Zod schema + validate (DTO 文件三件套)
export const schemaActionInputCreateDeck = z.object({ ... });
export type ActionInputCreateDeck = z.infer<typeof schemaActionInputCreateDeck>;
export const validateActionInputCreateDeck = generateValidator(schemaActionInputCreateDeck);
```

### Action 模板

```typescript
"use server";

import { validate } from "@/utils/validate";
import { schemaActionInputCreateDeck, type ActionInputCreateDeck, type ActionOutputCreateDeck } from "./deck-action-dto";
import { serviceCreateDeck } from "./deck-service";
import { createLogger } from "@/lib/logger";
import { getCurrentUserId } from "@/modules/shared/action-utils";
import { ValidateError } from "@/lib/errors";

const log = createLogger("deck-action");

export async function actionCreateDeck(input: unknown): Promise<ActionOutputCreateDeck> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return { success: false, message: "Unauthorized" };

    const validated = validate(schemaActionInputCreateDeck, input);
    if (!validated.success) return { success: false, message: validated.message };

    return serviceCreateDeck({ ...validated.data, userId });
  } catch (e) {
    if (e instanceof ValidateError) return { success: false, message: e.message };
    log.error("Failed to create deck", { error: e });
    return { success: false, message: "Unknown error occurred" };
  }
}
```

### 受保护操作

```typescript
import { getCurrentUserId } from "@/modules/shared/action-utils";
const userId = await getCurrentUserId();
if (!userId) return { success: false, message: "Unauthorized" };

// 变更前检查所有权 (示例: card 检查 deck 归属)
const deckOwnerId = await repoGetUserIdByDeckId(deckId);
if (deckOwnerId !== userId) return { success: false, message: "Unauthorized" };
```

`getCurrentUserId()` 自动适配单/多用户模式,详见 [config-system.md](./config-system.md)。

所有 action 统一返回 `{ success: boolean; message: string; data?: T }`。

### 消费者地图

| 模块       | 主要消费者                                                             |
| ---------- | ---------------------------------------------------------------------- |
| deck       | decks/\*, dictionary, translator, explore, favorites, users/[username] |
| card       | decks/[deck_id]/\*, dictionary/DictionaryClient, translator            |
| auth       | login, signup, forgot-password, profile, users/[username]              |
| follow     | users/[username]/\*, FollowButton                                      |
| translator | translator/page, text-speaker/page                                     |
| dictionary | dictionary/DictionaryClient                                            |

> `activity` 不列入此表 — 它是横切模块,消费者是其他模块的 action (以及 better-auth databaseHooks 和 `synthesizeTts`),不是页面。

### 已知问题

- auth 模块的 `actionSignUp`/`actionSignIn`/`serviceSignUp`/`serviceSignIn` 已移除 (客户端直接用 authClient)
- forgot-password-service 始终返回通用消息,防止用户枚举
- dictionary/translator 模块不完整 (无 repo 层 — AI 驱动, 这是设计决定不是缺陷)

## 集成层 lib/ 速查

| 文件 | 用途 |
|------|------|
| `db.ts` | Prisma 客户端单例 (Prisma 7 PrismaPg adapter),生成路径 `generated/prisma/` |
| `providers/` | 外部 API 对接统一层: `llm.ts` (getAnswer) / `tts.ts` (synthesizeTts, server action) / `smtp.ts` (sendEmail)。对外暴露统一接口, 凭据服务端从 DB 读 |
| `email.ts` | 邮件模板 (generateVerificationEmailHtml 等); SMTP 发送已移至 `providers/smtp.ts` |
| `errors.ts` | 自定义错误类 `ValidateError`, `LookUpError` |
| `interfaces.ts` | 共享接口/Schema (TextSpeakerItemSchema, SupportedAlphabets) |
| `logger/` | Winston 日志 `createLogger("name")`,唯一允许的 barrel export |
| `browser/` | 客户端工具 (localStorage 操作) |
| `theme/` | 主题颜色定义 (CSS 自定义属性 + localStorage, 14 个预设) |

> 配置相关 (env/auth-mode/capability/admin-auth) 详见 [config-system.md](./config-system.md);AI 管道详见 [ai-pipelines.md](./ai-pipelines.md)。

## Server/Client 划分

- 默认 Server Component; Client 仅在需要时 (useState, useEffect, 浏览器 API)
- 加载状态: Server 页面配 loading.tsx (Skeleton)
- 错误边界: AI 密集路由配独立 error.tsx
- React Compiler 已启用, 不写 useCallback/useMemo
- Zod v4 校验, DTO 三件套 (schema + type + validate)
- 显式导入路径, 无 barrel exports (例外: logger/)
- 日志: Winston `createLogger("module")`

## 反模式 (本项目)

- `index.ts` barrel exports (例外: `src/lib/logger/`)
- `as any`, `@ts-ignore`, `@ts-expect-error`
- 用 API routes 做数据操作 (使用 Server Actions)
- `"use server"` 文件中使用 type 别名 (Turbopack 运行时 ReferenceError)
- `console.log` 在服务端代码 (客户端例外)
- 原生 `confirm()` / `prompt()` / `alert()`
- 内联 SVG 图标 (使用 Lucide React)

## 命令

```bash
pnpm dev           # 开发服务器
pnpm build         # 生产构建 (验证代码)
pnpm lint          # ESLint
pnpm prisma studio # 数据库 GUI
```

### 数据库同步

```bash
DATABASE_URL=your_db_url pnpm prisma db push
DATABASE_URL=your_db_url pnpm prisma generate
```

## 已知运行时陷阱

- **Turbopack `"use server"` type alias bug**: `"use server"` 模块中的 `type` 别名不被正确擦除 → 运行时 `ReferenceError`。类型必须内联或放在单独的非 `"use server"` 文件中 (如 `providers/tts-languages.ts`)。详见 [ai-pipelines.md](./ai-pipelines.md)
- `"use server"` 用于 action 文件和 AI 工具文件 (providers/llm.ts, providers/tts.ts, reading/orchestrator.ts)
- Vercel 部署后旧 serverless 实例可能继续服务请求

## 技术栈

- Tailwind CSS v4, React Compiler, TypeScript 6, ESLint ^9
- Zod v4, next-intl 9 种语言 (cookie 存储, 无 URL 前缀)
- Prisma 7 (`prisma-client` 生成器, PrismaPg adapter, 使用 db push)
- 未配置测试基础设施, 用 `pnpm build` 验证

> 配置/认证/管理后台见 [config-system.md](./config-system.md);页面加载/错误边界统计见 [pages.md](./pages.md)。
