# 配置系统

本项目配置分两层:**静态环境变量**(启动时定死,Zod 校验缺则崩溃)和**动态数据库配置**(运行时 admin 面板可热改)。两者解耦,业务代码通过统一入口消费。

## 环境变量 (静态,启动时)

`src/lib/env.ts` 用 Zod 在模块加载时校验,缺必填项立即崩溃 (fail-fast):

```typescript
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(1),
  BETTER_AUTH_URL: z.string().url().optional().default(""),
  ADMIN_PASSWORD: z.string().min(1),
  ADMIN_JWT_SECRET: z.string().min(1).optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});
```

| 变量 | 类型 | 用途 |
|------|------|------|
| `DATABASE_URL` | URL, 必填 | PostgreSQL 连接串 → `db.ts` |
| `BETTER_AUTH_SECRET` | 非空, 必填 | 用户认证 JWT 密钥;也作 admin JWT 兜底密钥 |
| `BETTER_AUTH_URL` | URL, 可选 | auth 服务 URL, 留空用当前域名 |
| `ADMIN_PASSWORD` | 非空, 必填 | `/admin` 登录密码 |
| `ADMIN_JWT_SECRET` | 非空, 可选 | admin JWT 独立密钥, 缺失回退 `BETTER_AUTH_SECRET` |
| `NODE_ENV` | enum | 影响 admin cookie `secure` 标志 |

> `NEXT_PUBLIC_AUTH_MODE` 绕过 Zod 直接读取 (见下文认证模式)。

## 能力系统 (动态,数据库驱动)

**扁平功能开关,默认全开,可单独禁用。** 4 个开关直接挂在 `SystemConfig` 单行表上:

| 开关 | 默认 | 关闭后效果 |
|------|------|-----------|
| `signup` | true | 登录/注册页面 404,better-auth API 路由整体禁用 |
| `userProfile` | true | 用户资料页、关注列表页 404 |
| `social` | true | 导航栏隐藏 explore(探索)入口 |
| `email` | true | 忘记密码、重置密码页面 404 |

### 数据模型

```prisma
model SystemConfig {
  id          Int      @id @default(1)   // 单例行, 固定 id=1
  signup      Boolean  @default(true)
  userProfile Boolean  @default(true)
  social      Boolean  @default(true)
  email       Boolean  @default(true)
  services    Json     @default("{}")    // { llm:{}, tts:{ apiKey }, smtp:{} }
  ...
}
```

### 查询层 `src/lib/capability.ts`

60s TTL 缓存 + single-flight 防惊群。admin 修改后调 `invalidateCapabilityCache()` 立即清缓存。

```typescript
import { hasCapability, getServices, getLlmConfig } from "@/lib/capability";

// 单个能力查询 (服务端)
if (!(await hasCapability("signup"))) notFound();

// 服务配置
const services = await getServices();
const { apiKey, apiUrl, modelName } = getLlmConfig(services);
```

公共 API:
- `getCapabilities()` → `Record<string, boolean>`
- `hasCapability(name)` → `boolean`
- `getServices()` → 原始 services JSON
- `getLlmConfig(services)` / `getTtsConfig(services)` / `getSmtpConfig(services)` → 解构后的配置对象

> `getTtsConfig(services)` 返回 `{ apiKey }`。`apiKey` 是 inference.sh 平台的 Bearer API Key (`inf_` 前缀, **仅服务端使用**, 由 `synthesizeTts` server action 消费, 永不下发前端)。apiKey 缺失则 TTS 不可用。TTS 调度细节见 [ai-pipelines.md](./ai-pipelines.md)。

### 客户端状态 `src/lib/capability-store.ts`

Zustand store,镜像服务端能力状态。根 layout 注入一次,后续任意客户端组件订阅:

```typescript
// 客户端组件
import { useCapabilityStore } from "@/lib/capability-store";
const noSignup = !useCapabilityStore((s) => s.has("signup"));
```

### Server → Client 注入

```
layout.tsx (Server): getCapabilities() → <CapabilityHydrator capabilities={...}>
capability-hydrator.tsx (Client): hydrate(capabilities) → Zustand store
任意客户端组件: useCapabilityStore(s => s.has("xxx"))
```

> 服务端用 `@/lib/capability` 的 async 函数;客户端用 `@/lib/capability-store` 的同步 hook。不能混用。

## 认证模式

**认证模式由 `NEXT_PUBLIC_AUTH_MODE` 控制** (环境变量,不是能力开关)。整个代码库只有一处判断,在 `src/modules/shared/action-utils.ts`:

```typescript
export async function getCurrentUserId(): Promise<string | null> {
  if (process.env.NEXT_PUBLIC_AUTH_MODE === "single") {
    return getSingleUserId();              // 单用户: 直接返回 admin ID
  }
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user?.id ?? null;        // 多用户: better-auth session
}
```

所有业务代码统一调 `getCurrentUserId()`,模式差异被收口在这一个函数里。

| 维度 | single (`=single`) | multi (默认/未设) |
|------|---------------------|-------------------|
| 认证机制 | 完全跳过 better-auth | 邮箱/密码 + 邮箱验证 |
| 用户来源 | 首次调用自动创建 `admin@localhost` | 用户主动注册 |
| Auth 页面 | `notFound()` | 正常路由 |
| Navbar | 始终显示已登录 | 按 session 状态切换 |

`getSingleUserId()` (`src/lib/auth-mode.ts`) 惰性自动建户,模块级 memoize,catch 块处理并发首次调用的 race condition。

> 能力开关 (`signup=false` 等) 与认证模式是**两个独立维度**。`signup=false` 通常对应单用户模式,但二者没有强制绑定。

## 管理后台

独立认证的后台管理面板 (`/admin`),管理功能开关和服务配置。**认证体系与用户认证完全独立。**

### 结构

```
src/app/admin/
├── page.tsx          # Server: JWT 验证, 加载 SystemConfig
├── AdminLogin.tsx    # Client: 密码登录表单
├── AdminSettings.tsx # Client: 功能开关/services 动态配置 UI + 用户管理入口卡片
├── admin-action.ts   # Server Actions: login, logout, getSettings, updateSettings + 用户管理 (create/update/delete/setEmailVerified)
└── users/
    ├── page.tsx      # Server: JWT 验证 (verifyAdminSession) + repoListUsers
    └── AdminUsers.tsx # Client: 用户列表/搜索/创建表单/编辑 Modal/删除(行内确认)/emailVerified 切换

src/modules/admin/
├── admin-repository.ts  # SystemConfig CRUD + 用户管理 (list/check/create/delete-cascade/setEmailVerified)
└── admin-service.ts     # 密钥掩码 + 缓存失效 + 用户管理业务逻辑 (hashPassword + 建 User/Account)
```

### Admin 认证 (独立 JWT)

- **密码比较**: `crypto.timingSafeEqual` (恒定时间,防时序攻击)
- **登录限流**: 5 次/15 分钟/IP,内存 Map 存储
- **JWT**:
  - 密钥: `ADMIN_JWT_SECRET` (回退 `BETTER_AUTH_SECRET`)
  - claims: iss `learn-languages-admin`,aud `admin-panel`
  - cookie `admin_session`,`sameSite: strict`,`httpOnly: true`
  - 过期: **8h**
- **密码来源**: `serverEnv.ADMIN_PASSWORD` (环境变量),不从 DB 读取

### 密钥掩码机制

`src/modules/admin/admin-service.ts`:

```typescript
export const SECRET_MASK = "••••••••";

// GET 时: 有值返回掩码, 无值返回空串 (不泄露"是否存在")
export function maskSecret(value) { return value?.length > 0 ? SECRET_MASK : ""; }

// UPDATE 时: 若提交值===掩码 → 保留 DB 原值; 否则用新值
export function preserveSecret(incoming, current) {
  return incoming === SECRET_MASK ? (current ?? "") : incoming;
}
```

LLM apiKey、TTS apiKey、SMTP pass 三处敏感字段走此逻辑。

### 配置更新流程

```
AdminSettings 保存
  → actionUpdateAdminSettings (Zod 校验 + JWT 鉴权)
  → serviceUpdateAdminSettings (密钥掩码合并)
  → repoUpdateSystemConfig (upsert SystemConfig: capabilities + services)
  → invalidateCapabilityCache() (清 60s 缓存)
  → 客户端 useCapabilityStore.updateAll() + router.refresh()
```

### 约定

- **无 i18n**: 管理后台仅中文,字符串硬编码
- Server→Client 委托: page.tsx 验证身份并加载数据,传给 Client 组件渲染
- 配置更新后必须调 `invalidateCapabilityCache()` 清缓存
- 登录成功后创建 JWT cookie 并刷新页面,不用客户端状态

### 用户管理 (`/admin/users`)

复用 `/admin` 的 JWT 认证 (`verifyAdminSession`),在 `AdminSettings` 顶部入口卡片进入。四类操作全走 `admin-action.ts` (Zod 校验 + 鉴权):

- **创建** (`actionCreateUser` → `serviceCreateUser`): 提交 name/email/username/password。服务层用 `hashPassword` (`better-auth/crypto`) 哈希明文密码,在**同一事务**里建 User + credential Account。admin 创建的用户 `emailVerified` 默认 **true** (跳过邮箱验证流程)
- **列表/搜索** (`repoListUsers`): 按 username/email 模糊搜索,返回分页用户列表
- **删除** (`actionDeleteUser` → `repoDeleteUserCascade`): 级联清理该用户**全部数据** (decks / cards / sessions / follows / accounts),不可恢复。UI 用行内确认防误触
- **修改** (`actionUpdateUser` → `serviceUpdateUser`): 编辑 name/email/username,可选重置密码 (留空保持不变,填了则用 `hashPassword` 重新哈希写回 credential Account)。唯一性检查排除自身。UI 用 Modal 表单
- **emailVerified 切换** (`actionSetUserEmailVerified` → `repoSetUserEmailVerified`): 翻转邮箱验证标志

> 用户管理与配置更新共用同一套 admin JWT 认证体系,不引入新的鉴权机制。

## 可热改 vs 不可热改

| 可热改 (admin 面板,无需重启) | 不可热改 (改 env + 重启) |
|-------------------------------|--------------------------|
| LLM apiKey / apiUrl / modelName | DATABASE_URL |
| TTS API Key (inference.sh) | BETTER_AUTH_SECRET |
| SMTP 全套 (host/port/user/pass/from/secure) | ADMIN_PASSWORD |
| 4 个功能开关 (signup/userProfile/social/email) | ADMIN_JWT_SECRET |
|  | NEXT_PUBLIC_AUTH_MODE |

> TTS API Key (inference.sh Bearer token) 虽可热改, 但**仅服务端读取**, 由 `synthesizeTts` server action 消费, 前端只拿到最终音频, 凭据不暴露。

## 初始化

```bash
DATABASE_URL=xxx npx tsx scripts/seed-capabilities.ts
```

seed 脚本写入默认 SystemConfig (4 个功能开关全开 + 默认 services)。
