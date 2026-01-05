# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此代码库中工作时提供指导。

## 项目概述

这是一个基于 Next.js 16 构建的全栈语言学习平台，提供翻译工具、文本转语音、字幕播放、字母学习和记忆功能。平台支持 8 种语言，具有完整的国际化支持。

## 开发命令

```bash
# 启动开发服务器（启用 HTTPS）
pnpm run dev

# 构建生产版本（standalone 输出模式，用于 Docker）
pnpm run build

# 启动生产服务器
pnpm run start

# 代码检查
pnpm run lint

# 数据库操作
pnpm prisma generate    # 生成 Prisma client 到 src/generated/prisma
pnpm prisma db push     # 推送 schema 变更到数据库
pnpm prisma studio      # 打开 Prisma Studio 查看数据库
```

## 技术栈

- **Next.js 16** 使用 App Router 和 standalone 输出模式
- **React 19** 启用 React Compiler 进行优化
- **TypeScript** 严格模式和 ES2023 目标
- **Tailwind CSS v4** 样式框架
- **PostgreSQL** + **Prisma ORM**（自定义输出目录：`src/generated/prisma`）
- **better-auth** 身份验证（邮箱/密码 + OAuth）
- **next-intl** 国际化（支持：en-US, zh-CN, ja-JP, ko-KR, de-DE, fr-FR, it-IT, ug-CN）
- **edge-tts-universal** 文本转语音
- **pnpm** 包管理器

## 架构设计

### 路由结构

应用使用 Next.js App Router 和基于功能的组织方式：

```
src/app/
├── (features)/       # 功能模块（translator, alphabet, memorize, dictionary, srt-player）
│   └── [locale]/    # 国际化路由
├── auth/            # 认证页面（sign-in, sign-up）
├── folders/         # 用户学习文件夹管理
├── api/             # API 路由
└── profile/         # 用户资料页面
```

### 数据库 Schema

核心模型（见 [prisma/schema.prisma](prisma/schema.prisma)）：
- **User**: 用户中心实体，包含认证信息
- **Folder**: 用户拥有的学习资料容器（级联删除 pairs）
- **Pair**: 语言对（翻译/词汇），支持 IPA，唯一约束为 (folderId, locale1, locale2, text1)
- **Session/Account**: better-auth 追踪
- **Verification**: 邮箱验证系统

### 核心模式

**Server Actions**: 数据库变更使用 `src/lib/actions/` 中的 Server Actions，配合类型安全的 Prisma 操作。

**基于功能的组件**: 每个功能在 `(features)/` 下有自己的路由组，带有 locale 前缀。

**国际化**: 所有面向用户的内容通过 next-intl 处理。消息文件在 `messages/` 目录。locale 自动检测并在路由中前缀。

**认证流程**: better-auth 使用客户端适配器 (`authClient`)，通过 hooks 管理会话，受保护的路由使用条件渲染。

**LLM 集成**: 使用智谱 AI API 进行翻译和 IPA 生成。通过环境变量 `ZHIPU_API_KEY` 和 `ZHIPU_MODEL_NAME` 配置。

### 环境变量

需要在 `.env.local` 中配置：

```env
# LLM 集成
ZHIPU_API_KEY=your-api-key
ZHIPU_MODEL_NAME=your-model-name

# 认证
BETTER_AUTH_SECRET=your-secret
BETTER_AUTH_URL=http://localhost:3000
GITHUB_CLIENT_ID=your-client-id
GITHUB_CLIENT_SECRET=your-client-secret

# 数据库
DATABASE_URL=postgresql://username:password@localhost:5432/database_name

// DashScore
DASHSCORE_API_KEY=
```

## 重要配置细节

- **Prisma client 输出**: 自定义目录 `src/generated/prisma`（不是默认的 `node_modules/.prisma`）
- **Standalone 输出**: 为 Docker 部署配置
- **React Compiler**: 在 `next.config.ts` 中启用以自动优化
- **HTTPS 开发**: 开发服务器使用 `--experimental-https` 标志
- **图片优化**: 通过 remote patterns 允许 GitHub 头像

## 代码组织

- `src/lib/actions/`: 数据库变更的 Server Actions
- `src/lib/server/`: 服务端工具（AI 集成、认证、翻译器）
- `src/lib/browser/`: 客户端工具
- `src/hooks/`: 自定义 React hooks（认证 hooks、会话管理）
- `src/i18n/`: 国际化配置
- `messages/`: 各支持语言的翻译文件
- `src/components/`: 可复用的 UI 组件（buttons, cards 等）

## 开发注意事项

- 使用 pnpm，而不是 npm 或 yarn
- schema 变更后，先运行 `pnpm prisma generate` 再运行 `pnpm prisma db push`
- 应用使用 TypeScript 严格模式 - 确保类型安全
- 所有面向用户的文本都需要国际化
- Better-auth 处理会话管理 - 使用 authClient 适配器进行认证操作
