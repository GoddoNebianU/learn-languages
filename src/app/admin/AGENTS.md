# Admin 管理后台

独立认证的后台管理面板，管理系统能力层（tier）和服务配置。**认证体系与用户认证完全独立。**

## 结构

```
src/app/admin/
├── page.tsx          # Server: JWT 验证，加载 SystemConfig + TierCapability，传给 Client
├── AdminLogin.tsx    # Client: 密码登录表单
├── AdminSettings.tsx # Client: tier/services 动态配置 UI (308 行) — 增删改 tier + services
└── admin-action.ts   # Server Actions (277 行): login, logout, getSettings, updateSettings, addTier, deleteTier, addService, deleteService
```

## 查找位置

| 任务                 | 位置                  | 备注                                      |
| -------------------- | --------------------- | ----------------------------------------- |
| 修改登录/登出逻辑    | `admin-action.ts`     | login/logout actions                      |
| 修改配置管理逻辑     | `admin-action.ts`     | getSettings/updateSettings/addTier 等     |
| 修改配置 UI          | `AdminSettings.tsx`   | tier 开关 + services 增删                 |
| 修改登录表单         | `AdminLogin.tsx`      | 密码输入 + 提交                           |
| 修改页面入口逻辑     | `page.tsx`            | JWT 验证 → 决定显示 Login 或 Settings     |
| JWT 工具函数         | `@/lib/admin-auth.ts` | getAdminPassword, createAdminSession 等   |
| 能力系统查询         | `@/lib/capability.ts` | hasCapability, getLlmConfig 等            |

## 约定

- **无 i18n**: 管理后台仅中文，所有字符串硬编码
- **认证独立**: JWT cookie `admin_session`，与 better-auth 用户认证无关
- **Server→Client 委托**: page.tsx 验证身份并加载数据，传给 Client 组件渲染
- **配置更新后必须调用**: `capability.invalidateCapabilityCache()` 清除内存缓存
- **密码来源**: `serverEnv.ADMIN_PASSWORD`（环境变量），不从 DB 读取
- **DB 模型**: `SystemConfig`（tier + services JSON）、`TierCapability`（tier PK + 4 布尔能力）

## 注意

- AdminSettings 是最复杂组件，管理 tier 能力开关和服务列表的增删
- 登录成功后创建 JWT cookie 并刷新页面，不使用客户端状态管理
- 所有配置变更 action 返回 `{ success, message }` 统一格式
