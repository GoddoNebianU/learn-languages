# LEARN-LANGUAGES 知识库

**生成时间:** 2026-03-08
**提交:** 6ba5ae9
**分支:** dev

## 概述

全栈语言学习平台，集成 AI 翻译、词典和 TTS。Next.js 16 App Router + PostgreSQL + better-auth + next-intl。

## 结构

```
src/
├── app/              # Next.js 路由 (Server Components)
│   ├── (auth)/       # 认证页面: 登录、注册、个人资料
│   ├── (features)/   # 功能页面: 翻译、词典、字幕播放器
│   ├── folders/      # 文件夹管理
│   └── api/auth/     # better-auth catch-all
├── modules/          # 业务逻辑 (action-service-repository)
│   ├── auth/         # 认证 actions, services, repositories
│   ├── translator/   # 翻译模块
│   ├── dictionary/   # 词典模块
│   └── folder/       # 文件夹管理模块
├── design-system/    # 可复用 UI 基础组件 (CVA)
├── components/       # 业务组件
├── lib/              # 集成层 (db, auth, bigmodel AI)
├── hooks/            # 自定义 hooks (useAudioPlayer, useFileUpload)
├── utils/            # 纯工具函数 (cn, validate, json)
└── shared/           # 类型和常量
```

## 查找位置

| 任务 | 位置 | 备注 |
|------|------|------|
| 添加功能页面 | `src/app/(features)/` | 路由组，无 URL 前缀 |
| 添加认证页面 | `src/app/(auth)/` | 登录、注册、个人资料 |
| 添加业务逻辑 | `src/modules/{name}/` | 遵循 action-service-repository |
| 添加 AI 管道 | `src/lib/bigmodel/{name}/` | 多阶段 orchestrator |
| 添加 UI 组件 | `src/design-system/{category}/` | base, feedback, layout, overlay |
| 添加工具函数 | `src/utils/` | 纯函数 |
| 添加类型定义 | `src/shared/` | 业务类型 |
| 数据库查询 | `src/modules/*/` | Repository 层 |
| i18n 翻译 | `messages/*.json` | 8 种语言 |

## 约定

### 架构: Action-Service-Repository
每个模块 6 个文件:
```
{name}-action.ts       # Server Actions, "use server"
{name}-action-dto.ts   # Zod schemas, ActionInput*/ActionOutput*
{name}-service.ts      # 业务逻辑, 跨模块调用
{name}-service-dto.ts  # ServiceInput*/ServiceOutput*
{name}-repository.ts   # Prisma 操作
{name}-repository-dto.ts # RepoInput*/RepoOutput*
```

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
- Zod schemas 放在 `*-dto.ts`
- 使用 `validate()` from `@/utils/validate`

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

const log = createLogger("folder-repository");

log.debug("Fetching public folders");
log.info("Fetched folders", { count: folders.length });
log.error("Failed to fetch folders", { error });
```

## 反模式 (本项目)

- ❌ `index.ts` barrel exports
- ❌ `as any`, `@ts-ignore`, `@ts-expect-error`
- ❌ 用 API routes 做数据操作 (使用 Server Actions)
- ❌ Server Component 可行时用 Client Component
- ❌ npm 或 yarn (使用 pnpm)
- ❌ 生产代码中使用 `console.log` (使用 winston logger)
- ❌ 擅自运行 `pnpm dev` (不需要，用 `pnpm build` 验证即可)

## 独特风格

### 设计系统分类
- `base/` — 原子组件: button, input, card, checkbox, radio, switch, select, textarea, range
- `feedback/` — 反馈: alert, progress, skeleton, toast
- `layout/` — 布局: container, grid, stack (VStack, HStack)
- `overlay/` — 覆盖层: modal
- `navigation/` — 导航: tabs

### AI 管道模式
`src/lib/bigmodel/` 中的多阶段 orchestrator:
```
{name}/
├── orchestrator.ts      # 协调各阶段
├── types.ts             # 共享接口
└── stage{n}-{name}.ts   # 各阶段实现
```

### 废弃函数
`translator-action.ts` 中的 `genIPA()` 和 `genLanguage()` — 保留用于 text-speaker 兼容

## 命令

```bash
pnpm dev           # 开发服务器 (HTTPS)
pnpm build         # 生产构建 (验证代码)
pnpm lint          # ESLint
pnpm prisma studio # 数据库 GUI
```

### 数据库迁移

**必须使用 `prisma migrate dev`，禁止使用 `db push`：**

```bash
# 修改 schema 后创建迁移
DATABASE_URL=your_db_url pnpm prisma migrate dev --name your_migration_name

# 生成 Prisma Client
DATABASE_URL=your_db_url pnpm prisma generate
```

`db push` 会绕过迁移历史，导致生产环境无法正确迁移。

## 备注

- Tailwind CSS v4 (无 tailwind.config.ts)
- React Compiler 已启用
- i18n: 8 种语言 (en-US, zh-CN, ja-JP, ko-KR, de-DE, fr-FR, it-IT, ug-CN)
- TTS: 阿里云千问 (qwen3-tts-flash)
- 数据库: PostgreSQL via Prisma (生成在 `generated/prisma/`)
- 未配置测试基础设施
