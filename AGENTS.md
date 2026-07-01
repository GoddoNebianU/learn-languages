# LEARN-LANGUAGES

全栈语言学习平台,集成 AI 翻译、词典和 TTS。Next.js 16 App Router + PostgreSQL + better-auth + next-intl。扁平功能开关,默认全开,可单独禁用。

所有详细文档在 [`docs/AGENTS.md`](./docs/AGENTS.md) — 按主题索引、内容边界、快速导航、项目理念均在其中。

## 约定

- 每个完整的改动之后都要 git commit
- 每次改动后检查文档与代码是否对齐,有偏差就同步更新（文档包括 `docs/`、`README.md`、`README.zh-CN.md`）
- 数据库 schema 有变更时,git push 之前要先 `prisma db push` 到 `.env` 和 `.env.production` 两个数据库
- 所有 `.ts` / `.tsx` 文件不超过 **400 行**；超出则按职责拆分（`pnpm lint:max-lines` 检查）
- **公开内容对未登录用户开放**：课程浏览/详情/课文、牌组探索、字母表不需要登录。AI 功能（翻译、词典、阅读、TTS）和个人内容（我的牌组、收藏、背单词、课程编辑）需要登录。
