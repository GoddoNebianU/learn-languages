# 文档索引

本目录是 learn-languages 项目的详细文档。根目录 `AGENTS.md` 是精简入口,详细内容在此。

## 内容边界

每个文档有明确的职责范围。**同一主题只在一个文档详细展开,其他文档只引用不重复。**

| 文档 | 负责 (owns) | 不负责 → 指向 |
|------|------------|--------------|
| [architecture.md](./architecture.md) | 目录结构、模块架构 (Action-Service-Repository)、lib/ 非配置集成层 (db/email/errors/logger/browser/theme)、Server/Client 通用约定、反模式、命令、运行时陷阱、技术栈 | 认证/配置 → config-system;AI 管道 → ai-pipelines;页面 → pages;组件 → components |
| [config-system.md](./config-system.md) | 环境变量、能力系统 (4 个功能开关)、认证模式 (getCurrentUserId / single/multi)、管理后台 | action 如何调认证 → architecture (action 模板);页面如何守卫 → pages |
| [ai-pipelines.md](./ai-pipelines.md) | AI 管道实现 (dictionary/translator/reading)、TTS 服务、共享依赖、"use server" 类型限制 | 页面如何调用 → pages/features;模块层 → architecture |
| [pages.md](./pages.md) | 路由组、4 种渲染模式、同目录组件约定、i18n namespace 映射、关键数据流 (简单页) | 复杂功能页详情 → features;认证机制 → config-system;组件定义 → components |
| [features.md](./features.md) | 复杂功能页详解 (decks/dictionary/srt-player/reading 的组件结构和交互) | 通用页面架构 → pages;AI 管道实现 → ai-pipelines |
| [components.md](./components.md) | 业务组件 (layout/follow/ui)、设计系统 (21 个 CVA 组件) | 页面如何使用 → pages/features |

## 项目理念

| 文档 | 内容 |
|------|------|
| [开发之道.md](./开发之道.md) | 开发原则: 分层职责、认证与所有权、输入校验、i18n、日志、无障碍 |
| [架构思想.md](./架构思想.md) | 架构理念: 数据流、层级边界、AI 管道、配置即产品、认证双轨、错误处理 |
| [项目精神.md](./项目精神.md) | 项目愿景: 为什么存在、为谁而建、相信什么、不做什么 |

理念文档讲"为什么"(设计哲学),实现文档讲"怎么做",两类互不重叠。

## 快速导航

- **改业务逻辑** → architecture.md (模块架构) + 对应模块的 `src/modules/{name}/`
- **改配置/认证** → config-system.md
- **加 AI 功能** → ai-pipelines.md
- **加/改页面** → pages.md (架构) 或 features.md (复杂页)
- **加/改 UI** → components.md
- **查命令** → architecture.md (命令章节)
- **查反模式/陷阱** → architecture.md (反模式 + 已知运行时陷阱)

## 约定

- 每个文档控制在 400 行以内
- **同一主题只在一个文档展开,其他只引用链接** (避免内容重叠)
- 文档与代码同步更新 (配置系统等重构后必须同步)
- 文档语言: 中文为主
