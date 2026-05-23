# LIB 知识库

**概述**

集成层。环境配置、数据库连接、认证模式、能力系统、AI 管道、邮件、日志、浏览器工具、主题。

## 结构

```
lib/
├── auth-mode.ts        # 单/多用户模式切换
├── auth-client.ts      # better-auth 客户端
├── admin-auth.ts       # JWT 管理后台认证 (jose)
├── capability.ts       # 部署能力系统 (DB 驱动, 内存缓存)
├── capability-store.ts # Zustand 客户端能力状态
├── db.ts               # Prisma 客户端单例 (PrismaPg adapter)
├── email.ts            # nodemailer 邮件服务
├── env.ts              # Zod 校验服务端环境变量
├── errors.ts           # 自定义错误类
├── interfaces.ts       # 共享接口/Schema
├── bigmodel/           # AI 管道 — 见子级 AGENTS.md
├── browser/            # 客户端工具 (localStorage)
├── logger/             # Winston 日志 (唯一允许的 barrel export)
└── theme/              # 主题颜色定义
```

## 查找位置

| 任务 | 位置 | 备注 |
|------|------|------|
| 环境变量 | `env.ts` | Zod 校验, 启动时崩溃 |
| 数据库连接 | `db.ts` | Prisma 7 PrismaPg, 非 prisma-client-js |
| 单用户模式 | `auth-mode.ts` | `isSingleUserMode()` / `getSingleUserId()` |
| 管理后台认证 | `admin-auth.ts` | JWT cookie, 独立于用户认证 |
| 能力/配置查询 | `capability.ts` | `hasCapability` / `getLlmConfig` / `getTtsConfig` / `getSmtpConfig` |
| 客户端能力状态 | `capability-store.ts` | Zustand, 由 capability-hydrator 注入 |
| 发邮件 | `email.ts` | SMTP 配置从 DB 读取, 非 env |
| 错误类 | `errors.ts` | `ValidateError`, `LookUpError` |
| 共享类型 | `interfaces.ts` | TextSpeakerItemSchema, SupportedAlphabets |
| 日志 | `logger/` | `createLogger("name")`, 唯一 barrel export |
| 客户端存储 | `browser/` | localStorage 操作 |
| AI 管道 | `bigmodel/` | LLM/TTS/翻译/词典/OCR — 见子级 AGENTS.md |

## 约定

- 所有服务配置 (LLM/TTS/SMTP) 从 `capability.ts` 获取, 不直接读环境变量
- `env.ts` 用 Zod 校验必填变量, 缺失时启动崩溃
- `db.ts` 单例模式, Prisma 7 `prisma-client` 生成器 + PrismaPg adapter
- `logger/` 是唯一允许的 barrel export (index.ts)
- `capability.ts` 缓存机制: DB 读取后内存缓存, admin 设置变更时调 `invalidateCapabilityCache()`

## 已知陷阱

- `capability.ts` 的缓存不会自动失效, admin 修改 tier/services 后必须手动调 `invalidateCapabilityCache()`
- `admin-auth.ts` 和用户认证完全独立, JWT cookie 名 `"admin_session"`, 签名用 BETTER_AUTH_SECRET
- `env.ts` 仅校验服务端变量, 客户端变量 (NEXT_PUBLIC_*) 不在此校验
- `db.ts` 生成路径为 `generated/prisma/`, 非 `node_modules/.prisma/`
- `email.ts` 的 SMTP 配置从 DB 读取 (via `getSmtpConfig()`), 非环境变量
