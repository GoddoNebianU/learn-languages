# 多语言学习平台

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-16.2.4-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.5-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-336791?logo=postgresql)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-AGPL--3.0-blue)](./LICENSE)

一个全栈多语言学习平台，集成 AI 翻译、词典查询、语音合成和学习卡片管理。

[在线演示](#) · [报告问题](../../issues) · [功能建议](../../issues)

</div>

---

## 核心特性

### 学习工具

- **智能翻译** - 基于 AI 的多语言互译，支持 IPA 音标标注和语言检测
- **词典查询** - AI 驱动的单词查询，包含词性分析、释义和例句生成
- **SRT 字幕播放器** - 字幕文件播放与学习，支持词汇提取和翻译
- **语音合成** - 阿里云千问 TTS 提供多语言自然语音输出
- **字母学习** - 多语言字母表浏览与学习
- **探索与收藏** - 发现公开牌组，收藏感兴趣的学习内容

### 牌组与卡片管理

- **牌组管理** - 创建、编辑、删除牌组，支持公开/私有可见性设置
- **卡片系统** - 支持单词、短语、句子三种卡片类型，每张卡片可包含多条释义
- **记忆模式** - 多种学习模式（顺序/随机/无限循环），支持翻转和听写
- **收藏功能** - 收藏其他用户的公开牌组

### 用户系统

- **多方式认证** - 邮箱/密码登录、用户名登录、GitHub OAuth
- **邮箱验证** - 注册后自动发送验证邮件，验证后自动登录，支持重发验证邮件
- **密码找回** - 支持邮箱验证的重置密码流程
- **个人资料** - 用户主页、简介、学习资料展示
- **关注系统** - 关注/取消关注其他用户，查看粉丝和关注列表
- **数据安全** - better-auth 提供认证保障

### 国际化

- **8 种语言** - en-US, zh-CN, ja-JP, ko-KR, de-DE, fr-FR, it-IT, ug-CN
- **完整本地化** - 所有界面文本支持多语言

### 技术亮点

- **App Router** - Next.js 16 路由系统
- **Server Components** - 优先服务端渲染，优化性能
- **React Compiler** - 已启用 React 编译器自动优化
- **Action-Service-Repository** - 清晰的三层架构设计
- **类型安全** - TypeScript 严格模式 + Zod v4 验证
- **统一设计系统** - CVA 组件 + Lucide 图标，零原生弹窗

---

## 快速开始

### 前置要求

- Node.js 24+
- PostgreSQL 14+
- pnpm

### 安装步骤

```bash
# 1. 克隆项目
git clone <repository-url>
cd learn-languages

# 2. 安装依赖
pnpm install

# 3. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 填写必要配置

# 4. 初始化数据库
pnpm prisma generate
DATABASE_URL=your_db_url pnpm prisma migrate dev --name init

# 5. 启动开发服务器
pnpm dev
```

访问 **http://localhost:3000** 开始使用。

### 环境变量配置

```env
# AI 服务（必需）
ZHIPU_API_KEY=your-api-key          # 智谱 AI - 翻译和词典
ZHIPU_MODEL_NAME=your-model-name    # 模型名称
DASHSCORE_API_KEY=your-api-key      # 阿里云 TTS

# 认证配置（必需）
BETTER_AUTH_SECRET=your-secret      # 随机字符串
BETTER_AUTH_URL=http://localhost:3000

# GitHub OAuth（可选）
GITHUB_CLIENT_ID=your-client-id
GITHUB_CLIENT_SECRET=your-client-secret

# 数据库（必需）
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

---

## 技术栈

<table>
<tr>
<td width="50%">

### 前端

- **Next.js 16.2.4** - App Router
- **React 19.2.5** - UI 框架
- **TypeScript 6.x** - 类型安全
- **Tailwind CSS 4** - 样式方案（无 tailwind.config.ts）
- **Lucide React** - 图标库
- **Zustand 5** - 状态管理
- **next-intl** - 国际化

</td>
<td width="50%">

### 后端

- **PostgreSQL** - 关系数据库
- **Prisma 7.7.0** - ORM（prisma-client 生成器，PrismaPg adapter）
- **better-auth 1.6.5** - 认证系统
- **智谱 AI** - LLM 服务（翻译、词典）
- **阿里云千问 TTS** - 语音合成
- **Winston** - 日志系统

</td>
</tr>
</table>

---

## 项目架构

```
learn-languages/
├── src/
│   ├── app/                        # Next.js 路由
│   │   ├── (auth)/                 # 认证: login, signup, logout, forgot/reset-password, users/[username]
│   │   ├── (account)/             # 账户: profile, settings
│   │   ├── (learn)/               # 功能页面
│   │   │   ├── translator/        #   智能翻译
│   │   │   ├── dictionary/        #   词典查询
│   │   │   ├── srt-player/        #   SRT 字幕播放器（含组件、hooks、stores、utils）
│   │   │   ├── text-speaker/      #   语音合成
│   │   │   ├── alphabet/          #   字母学习
│   │   │   ├── memorize/          #   记忆模式（?deck_id=xxx）
│   │   │   ├── explore/           #   探索公开牌组
│   │   │   ├── favorites/         #   收藏列表
│   │   │   └── decks/             #   牌组管理
│   │   ├── error.tsx              # 根级错误边界
│   │   ├── not-found.tsx          # 404 页面
│   │   └── api/auth/              # better-auth catch-all（唯一 API 路由）
│   │
│   ├── modules/                   # 业务模块（三层架构）
│   │   ├── auth/                  # 认证模块（12 文件）
│   │   ├── card/                  # 卡片模块（5 文件）
│   │   ├── deck/                  # 牌组模块（最复杂，12 actions，310 行 repo）
│   │   ├── follow/                # 关注模块
│   │   ├── dictionary/            # 词典模块（AI 驱动，无 repository 层）
│   │   ├── translator/            # 翻译模块（AI 驱动，无 repository 层）
│   │   └── shared/                # 跨模块工具（getCurrentUserId, requireAuth）
│   │
│   ├── design-system/             # CVA 基础组件（14 个文件，无子目录）
│   │   ├── button.tsx             #   按钮（primary/light 变体）
│   │   ├── icon-button.tsx        #   图标按钮
│   │   ├── link-button.tsx        #   链接按钮
│   │   ├── card.tsx               #   卡片（compound 组件）
│   │   ├── input.tsx              #   输入框
│   │   ├── select.tsx             #   下拉选择
│   │   ├── textarea.tsx           #   多行文本框
│   │   ├── range.tsx              #   滑块
│   │   ├── progress.tsx           #   进度条
│   │   ├── skeleton.tsx           #   骨架屏
│   │   ├── stack.tsx              #   VStack/HStack 布局
│   │   ├── container.tsx          #   容器
│   │   ├── modal.tsx              #   模态框（compound 组件）
│   │   └── overflow-dropdown.tsx  #   溢出下拉菜单
│   │
│   ├── components/                # 业务组件
│   │   ├── layout/                #   Navbar, NavSession, MobileMenu, LanguageSettings
│   │   ├── follow/                #   FollowButton, FollowStats, UserList
│   │   └── ui/                    #   PageLayout, PageHeader, CardList, LanguageSelector, LocaleSelector
│   │
│   ├── lib/                       # 集成层
│   │   ├── bigmodel/              #   AI 管道（llm, tts, translator, dictionary, ocr）
│   │   ├── browser/               #   客户端工具（localStorage）
│   │   ├── logger/                #   Winston 日志
│   │   └── theme/                 #   主题颜色
│   │
│   ├── hooks/                     # useAudioPlayer, useFileUpload
│   ├── utils/                     # cn, validate, json, string, random
│   ├── shared/                    # card-type, dictionary-type, translator-type, languages, theme-presets, constant
│   ├── config/                    # i18n, images
│   └── i18n/                      # next-intl 请求配置
│
├── prisma/                        # 数据库 Schema + 迁移
├── messages/                      # 多语言翻译文件（8 种语言）
├── public/
│   ├── alphabets/                 # 字母表 JSON 数据
│   └── fonts/                     # 维吾尔语字体
├── generated/prisma/              # Prisma Client 生成输出
└── Dockerfile                     # 3 阶段 Docker 构建
```

### 架构设计：Action-Service-Repository

```
┌─────────────────────────────────────────┐
│           Presentation Layer            │
│   (Server Components / Client Components)│
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│           Action Layer                  │
│  * Server Actions                       │
│  * Form Validation (Zod v4)             │
│  * Redirect & Error Handling            │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│           Service Layer                 │
│  * Business Logic                       │
│  * better-auth Integration              │
│  * Cross-module Coordination            │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│         Repository Layer                │
│  * Prisma Database Operations           │
│  * Data Access Abstraction              │
│  * Query Optimization                   │
│  （AI 驱动模块无此层）                    │
└─────────────────────────────────────────┘
```

AI 驱动的模块（translator、dictionary）不包含 repository 层，直接通过 LLM 服务获取数据。

---

## 核心模块

### 认证系统 (auth)

- 邮箱/密码登录、用户名登录、GitHub OAuth
- 注册时前端验证（用户名格式、邮箱、密码强度、确认密码）
- 邮箱验证流程（注册自动发邮件，验证后自动登录，支持重发）
- 未验证用户登录时提示并显示重发验证邮件按钮
- 忘记密码/重置密码
- 用户资料页（users/[username]）
- 账户删除（需确认用户名）

### 翻译模块 (translator)

- AI 驱动的多语言互译
- 语言自动检测
- IPA 音标标注（可选）
- 多阶段翻译管道（检测、翻译、音标生成）

### 词典模块 (dictionary)

- AI 驱动的单词查询（无本地数据库）
- 多阶段管道：预处理 + 词条生成
- 词性分析、释义、例句
- 纯 AI 模块，无 repository 层

### 牌组模块 (deck)

- 牌组 CRUD 操作
- 公开/私有可见性控制（PUBLIC/PRIVATE）
- 牌组收藏功能
- 用户间牌组浏览
- 记忆模式（/memorize?deck_id=xxx）：顺序/随机/无限循环，翻转/听写

### 卡片模块 (card)

- 三种卡片类型：单词（WORD）、短语（PHRASE）、句子（SENTENCE）
- 每张卡片包含多条释义（CardMeaning）
- IPA 音标标注
- 查询语言标记

### 关注模块 (follow)

- 关注/取消关注用户
- 粉丝和关注列表
- 关注统计

---

## 数据模型

核心数据模型关系：

```
User (用户)
  ├─ Account (账户)
  ├─ Session (会话)
  ├─ Verification (验证)
  ├─ Deck (牌组)
  │   ├─ Card (卡片)
  │   │   └─ CardMeaning (释义)
  │   └─ DeckFavorite (收藏)
  └─ Follow (关注关系)
      ├─ follower (关注者)
      └─ following (被关注者)
```

详细模型定义：[prisma/schema.prisma](./prisma/schema.prisma)

---

## 国际化支持

当前支持的语言：

| 语言     | 代码  | 区域   |
| -------- | ----- | ------ |
| English  | en-US | 美国   |
| 中文     | zh-CN | 中国   |
| 日本語   | ja-JP | 日本   |
| 한국어   | ko-KR | 韩国   |
| Deutsch  | de-DE | 德国   |
| Français | fr-FR | 法国   |
| Italiano | it-IT | 意大利 |
| ئۇيغۇرچە | ug-CN | 新疆   |

添加新语言：

1. 在 `messages/` 创建语言文件
2. 在 `src/config/` 添加 i18n 配置
3. 更新语言选择器组件

注意：翻译缺失不会被 build 检测出来，需要使用 AST-grep 手动审计。

---

## 开发指南

### 可用脚本

```bash
# 开发
pnpm dev              # 启动开发服务器 (HTTPS)
pnpm build            # 构建生产版本（验证代码）
pnpm start            # 启动生产服务器
pnpm lint             # ESLint 检查
pnpm format           # Prettier 格式检查
pnpm format:fix       # Prettier 格式化

# 数据库
pnpm prisma studio    # 打开数据库 GUI
DATABASE_URL=your_db_url pnpm prisma migrate dev --name <name>  # 创建迁移（必须使用此命令）
DATABASE_URL=your_db_url pnpm prisma generate                   # 生成 Prisma Client
```

**禁止使用 `prisma db push`，必须使用 `prisma migrate dev`。**

### 代码规范

- [x] TypeScript 严格模式
- [x] ESLint + TypeScript Plugin
- [x] 优先使用 Server Components
- [x] 新功能遵循 Action-Service-Repository 三层架构
- [x] 所有用户可见文本需要国际化
- [x] 复用设计系统组件（`src/design-system/`）
- [x] 显式路径导入（`@/design-system/button`），禁止 barrel exports
- [x] Zod v4 验证（默认导入：`import z from "zod"`）
- [x] Action 返回格式统一：`{ success: boolean; message: string; data?: T }`
- [x] 日志使用 Winston（`createLogger("module-name")`），禁止 `console.log`

### 目录约定

每个业务模块包含以下文件：

| 文件                  | 职责              |
| --------------------- | ----------------- |
| `{name}-action.ts`    | Server Actions    |
| `{name}-action-dto.ts`| Action 层验证     |
| `{name}-service.ts`   | 业务逻辑         |
| `{name}-service-dto.ts`| Service 层验证   |
| `{name}-repository.ts`| 数据访问          |
| `{name}-repository-dto.ts`| Repository 层验证 |

AI 驱动模块（translator、dictionary）无 repository 相关文件。

### Server/Client 划分

- 默认使用 Server Components（不加 `"use client"`）
- 仅在需要 useState、useEffect、浏览器 API 时使用 Client Components
- Server Actions 文件必须包含 `"use server"`

---

## 部署

### Docker

项目包含 Dockerfile，采用 3 阶段构建：

1. **deps** - 安装生产依赖
2. **builder** - 构建应用
3. **runner** - 生产运行环境（Node 24 Alpine，standalone 模式）

```bash
docker build -t learn-languages .
docker run -p 3000:3000 --env-file .env.local learn-languages
```

---

## 贡献指南

### 贡献流程

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码提交规范

```
feat: 新功能
fix: 修复问题
docs: 文档变更
style: 代码格式
refactor: 重构
test: 测试相关
chore: 构建/工具
```

---

## 许可证

本项目采用 [AGPL-3.0-only](./LICENSE) 许可证。

---

## 联系方式

- **问题反馈**：[GitHub Issues](../../issues)
- **邮箱**：goddonebianu@outlook.com
