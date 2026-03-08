# 模块层架构指南

**生成时间:** 2026-03-08

## 概述

业务模块采用 Action-Service-Repository 三层架构，每模块 6 个文件。

## 结构

```
{name}/
├── {name}-action.ts       # Server Actions
├── {name}-action-dto.ts   # Zod 验证 + 类型
├── {name}-service.ts      # 业务逻辑
├── {name}-service-dto.ts  # Service 类型
├── {name}-repository.ts   # 数据库操作
└── {name}-repository-dto.ts # Repository 类型
```

## 文件职责

| 层级 | 文件 | 职责 |
|------|------|------|
| Action | `*-action.ts` | 表单处理、Zod 验证、重定向、返回 ActionOutput |
| Service | `*-service.ts` | 业务逻辑、跨模块调用、调用 Repository |
| Repository | `*-repository.ts` | Prisma 查询、纯数据访问 |

## 命名约定

```typescript
// 类型命名
type ActionInputSignUp = { ... };
type ActionOutputSignUp = { ... };
type ServiceInputSignUp = { ... };
type RepoOutputUser = { ... };

// 函数命名
async function actionSignUp(input: ActionInputSignUp): Promise<ActionOutputSignUp>
async function serviceSignUp(input: ServiceInputSignUp): Promise<ServiceOutputSignUp>
async function repoFindUserByUsername(username: string): Promise<RepoOutputUser | null>

// 验证函数
function validateActionInputSignUp(input: unknown): ActionInputSignUp
```

## Action 模板

```typescript
"use server";

import { validate } from "@/utils/validate";
import { ActionInputSignUp, ActionOutputSignUp, schemaActionInputSignUp } from "./auth-action-dto";
import { serviceSignUp } from "./auth-service";

export async function actionSignUp(input: unknown): Promise<ActionOutputSignUp> {
  const validated = validate(schemaActionInputSignUp, input);
  if (!validated.success) return { success: false, message: validated.message };
  
  return serviceSignUp(validated.data);
}
```

## 受保护操作

```typescript
// 在 Action 中检查会话
import { auth } from "@/auth";
import { headers } from "next/headers";

const session = await auth.api.getSession({ headers: await headers() });
if (!session?.user?.id) {
  return { success: false, message: "未授权" };
}

// 变更前检查所有权
const isOwner = await checkOwnership(resourceId, session.user.id);
if (!isOwner) {
  return { success: false, message: "无权限" };
}
```

## 注意事项

- 所有 action 文件必须有 `"use server"` 指令
- DTO 文件只放 Zod schema 和类型定义
- Repository 层不处理业务逻辑，只做数据访问
- 跨模块调用通过 Service 层
