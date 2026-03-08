# AGENTS.md

```bash
# 使用以下命令检查代码合法性
pnpm build
```


- Next.js 16 使用 App Router
- TypeScript 严格模式和 ES2023 目标
- better-auth 身份验证（邮箱/密码）
- next-intl 国际化（支持：en-US, zh-CN, ja-JP, ko-KR, de-DE, fr-FR, it-IT, ug-CN）
- 阿里云千问 TTS (qwen3-tts-flash) 文本转语音
- 使用 pnpm，而不是 npm 或 yarn
- 应用使用 TypeScript 严格模式 - 确保类型安全
- 所有面向用户的文本都需要国际化
- **优先使用 Server Components**，只在需要交互时使用 Client Components
- **新功能应遵循 action-service-repository 架构**
- Better-auth 处理会话管理 - 使用 authClient 适配器进行认证操作
- 使用 better-auth username 插件支持用户名登录
- 组件尽量复用/src/design-system里的可复用组件与/src/components里的业务相关组件
- 不要创建index.ts
