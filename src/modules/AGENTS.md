# 模块层架构指南

**生成时间:** 2026-05-02

## 概述

业务模块采用 Action-Service-Repository 三层架构。7 个模块 + 1 个共享工具。

## 模块清单

| 模块       | 文件数 | Actions | 模式完整性         | 备注                              |
| ---------- | ------ | ------- | ------------------ | --------------------------------- |
| auth       | 12     | 3+1     | ✅ 完整 (两个子域) | auth + forgot-password 各 6 文件; signUp/signIn 由客户端直接调用 authClient |
| deck       | 6      | 12      | ✅ 完整            | 最复杂模块, 315 行 repository     |
| card       | 5      | 7       | ⚠️ 缺 service-dto  | 跨模块依赖 deck                   |
| follow     | 6      | 4       | ✅ 完整            | 自包含, 无外部依赖                |
| dictionary | 3      | 1       | ⚠️ 不完整          | 无 service/repo — AI 管道直接调用 |
| translator | 4      | 3       | ⚠️ 不完整          | 无 repo — AI 管道, 含废弃函数     |
| shared     | 1      | 0       | N/A                | getCurrentUserId, requireAuth     |

## 文件结构 (完整 6 文件模式)

```
{name}/
├── {name}-action.ts       # Server Actions, "use server"
├── {name}-action-dto.ts   # Zod schemas + 类型 + validate 函数
├── {name}-service.ts      # 业务逻辑, 跨模块调用
├── {name}-service-dto.ts  # Service 类型 (纯 TS, 无 Zod)
├── {name}-repository.ts   # Prisma 查询
└── {name}-repository-dto.ts # Repository 类型
```

## 不完整模块说明

### dictionary (3 文件)

- 有: action + action-dto + service-dto
- 无: service, repository, repository-dto
- 原因: 纯 AI 查询, 无数据库持久化
- action 直接调用 `@/lib/bigmodel/dictionary/orchestrator`

### translator (4 文件)

- 有: action + action-dto + service + service-dto
- 无: repository, repository-dto
- 原因: 翻译通过 AI 管道, 无数据库操作
- 废弃: genIPA(), genLanguage() — 保留用于 text-speaker 兼容

## 跨模块依赖

```
card-service ──> deck-repository (repoGetUserIdByDeckId 用于所有权检查)
```

**仅有这一条跨模块依赖。** 其余模块完全自包含。

## 命名约定

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

## Action 模板

```typescript
"use server";

import { validate } from "@/utils/validate";
import {
  schemaActionInputCreateDeck,
  type ActionInputCreateDeck,
  type ActionOutputCreateDeck,
} from "./deck-action-dto";
import { serviceCreateDeck } from "./deck-service";
import { createLogger } from "@/lib/logger";
import { getCurrentUserId } from "@/modules/shared/action-utils";
import { ValidateError } from "@/lib/errors";

const log = createLogger("deck-action");

export async function actionCreateDeck(input: unknown): Promise<ActionOutputCreateDeck> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return { success: false, message: "未授权" };

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

## 受保护操作

```typescript
// 推荐: 使用 shared 工具
import { getCurrentUserId } from "@/modules/shared/action-utils";
const userId = await getCurrentUserId();
if (!userId) return { success: false, message: "未授权" };

// 变更前检查所有权 (示例: card 检查 deck 归属)
const deckOwnerId = await repoGetUserIdByDeckId(deckId);
if (deckOwnerId !== userId) return { success: false, message: "无权限" };
```

## 返回格式

所有 action 统一返回:

```typescript
{ success: boolean; message: string; data?: T }
```

## 消费者地图

| 模块       | 主要消费者                                                             |
| ---------- | ---------------------------------------------------------------------- |
| deck       | decks/\*, dictionary, translator, explore, favorites, users/[username] |
| card       | decks/[deck_id]/\*, dictionary/DictionaryClient, translator            |
| auth       | login, signup, forgot-password, profile, users/[username]              |
| follow     | users/[username]/\*, FollowButton                                      |
| translator | translator/page, text-speaker/page                                     |
| dictionary | dictionary/DictionaryClient                                            |

## 已知问题

- `shared/action-utils.ts` 导出 getCurrentUserId/requireAuth，但 requireAuth 零消费者 (死代码)
- deck/follow/auth 模块内联重复 session 检查逻辑，仅 card 模块使用 getCurrentUserId
- `users/[username]/page.tsx` 直接导入 `repoGetDecksByUserId` 绕过 action/service 层 (违反架构)
- card 模块缺 `card-service-dto.ts`，类型定义内联在 card-service.ts 中
- auth 模块的 `actionSignUp`/`actionSignIn`/`serviceSignUp`/`serviceSignIn` 已移除 (客户端直接用 authClient)
- forgot-password-service 始终返回通用消息，防止用户枚举
