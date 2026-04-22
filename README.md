# 🌍 多语言学习平台

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.3-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-336791?logo=postgresql)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-AGPL--3.0-blue)](./LICENSE)

**一个现代化的全栈多语言学习平台，集成 AI 驱动的翻译、发音、词典和学习管理功能**

[在线演示](#) · [报告问题](../../issues) · [功能建议](../../issues)

</div>

---

## ✨ 核心特性

### 🎯 学习工具

- **智能翻译** - 基于 AI 的多语言互译，支持 IPA 音标标注
- **词典查询** - 详细的单词释义、词性分析、例句展示
- **语音合成** - 阿里云千问 TTS 提供自然的语音输出
- **个人学习空间** - 文件夹管理、学习资料组织

### 🔐 用户系统

- **多方式认证** - 邮箱/用户名登录、GitHub OAuth
- **个人资料** - 用户主页、学习进度追踪
- **数据安全** - better-auth 提供企业级安全保障

### 🌐 国际化

- **8 种语言** - en-US, zh-CN, ja-JP, ko-KR, de-DE, fr-FR, it-IT, ug-CN
- **完整本地化** - 所有界面文本支持多语言

### 🏗️ 技术亮点

- **App Router** - 采用 Next.js 16 最新路由系统
- **Server Components** - 优先服务端渲染，优化性能
- **Action-Service-Repository** - 清晰的三层架构设计
- **类型安全** - TypeScript 严格模式 + Zod 验证

---

## 🚀 快速开始

### 前置要求

- Node.js 24+
- PostgreSQL 14+
- pnpm 8+ (推荐) 或 npm/yarn

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
pnpm prisma db push

# 5. 启动开发服务器
pnpm dev
```

访问 **http://localhost:3000** 开始使用！

### 环境变量配置

```env
# 🤖 AI 服务（必需）
ZHIPU_API_KEY=your-api-key          # 智谱 AI - 翻译和词典
ZHIPU_MODEL_NAME=your-model-name    # 模型名称
DASHSCORE_API_KEY=your-api-key      # 阿里云 TTS

# 🔐 认证配置（必需）
BETTER_AUTH_SECRET=your-secret      # 随机字符串
BETTER_AUTH_URL=http://localhost:3000

# 🐙 GitHub OAuth（可选）
GITHUB_CLIENT_ID=your-client-id
GITHUB_CLIENT_SECRET=your-client-secret

# 💾 数据库（必需）
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

---

## 🛠️ 技术栈

<table>
<tr>
<td width="50%">

### 前端

- **Next.js 16** - App Router
- **React 19** - UI 框架
- **TypeScript 5.9** - 类型安全
- **Tailwind CSS 4** - 样式方案
- **Zustand** - 状态管理
- **next-intl** - 国际化

</td>
<td width="50%">

### 后端

- **PostgreSQL** - 关系数据库
- **Prisma 7** - ORM
- **better-auth** - 认证系统
- **智谱 AI** - LLM 服务
- **阿里云 TTS** - 语音合成

</td>
</tr>
</table>

---

## 📁 项目架构

```
learn-languages/
├── 📂 src/
│   ├── 📂 app/                    # Next.js App Router
│   │   ├── 📂 (auth)/            # 认证相关页面
│   │   ├── 📂 folders/           # 文件夹管理
│   │   ├── 📂 users/[username]/  # 用户资料
│   │   └── 📂 api/               # API 路由
│   │
│   ├── 📂 modules/               # 业务模块（三层架构）
│   │   ├── 📂 auth/              # 认证模块
│   │   ├── 📂 folder/            # 文件夹模块
│   │   ├── 📂 dictionary/        # 词典模块
│   │   └── 📂 translator/        # 翻译模块
│   │
│   ├── 📂 components/            # React 组件
│   │   ├── 📂 ui/               # 通用 UI 组件
│   │   └── 📂 layout/           # 布局组件
│   │
│   ├── 📂 design-system/         # 设计系统
│   │   ├── 📂 base/             # 基础组件
│   │   ├── 📂 layout/           # 布局组件
│   │   └── 📂 feedback/         # 反馈组件
│   │
│   ├── 📂 lib/                   # 工具库
│   │   ├── 📂 bigmodel/         # AI 集成
│   │   ├── 📂 browser/          # 浏览器工具
│   │   └── 📂 server/           # 服务端工具
│   │
│   ├── 📂 hooks/                 # 自定义 Hooks
│   ├── 📂 i18n/                  # 国际化配置
│   ├── 📂 shared/                # 共享类型和常量
│   └── 📂 config/                # 应用配置
│
├── 📂 prisma/                    # 数据库 Schema
├── 📂 messages/                  # 多语言文件
└── 📂 public/                    # 静态资源
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
│  • Server Actions                       │
│  • Form Validation (Zod)                │
│  • Redirect & Error Handling            │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│           Service Layer                 │
│  • Business Logic                       │
│  • better-auth Integration              │
│  • Cross-module Coordination            │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│         Repository Layer                │
│  • Prisma Database Operations           │
│  • Data Access Abstraction              │
│  • Query Optimization                   │
└─────────────────────────────────────────┘
```

---

## 📚 核心模块

### 认证系统 (auth)

```typescript
// 支持多种登录方式
- 邮箱/密码登录
- 用户名登录
- GitHub OAuth
- 邮箱验证
```

### 翻译模块 (translator)

```typescript
// AI 驱动的智能翻译
- 多语言互译
- IPA 音标标注
- 翻译历史记录
- 上下文理解
```

### 词典模块 (dictionary)

```typescript
// 智能词典查询
-单词释义 - 词性分析 - 例句展示 - 词频统计;
```

### 文件夹模块 (folder)

```typescript
// 学习资料管理
- 创建/删除文件夹
- 添加语言对
- IPA 标注
- 批量管理
```

---

## 🗄️ 数据模型

核心数据模型关系：

```
User (用户)
  ├─ Account (账户)
  ├─ Session (会话)
  ├─ Folder (文件夹)
  │   └─ Pair (语言对)
  ├─ DictionaryLookUp (查询记录)
  │   └─ DictionaryItem (词典项)
  │       └─ DictionaryEntry (词条)
  └─ TranslationHistory (翻译历史)
```

详细模型定义：[prisma/schema.prisma](./prisma/schema.prisma)

---

## 🌍 国际化支持

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
2. 在 `src/i18n/config.ts` 添加配置
3. 更新语言选择器组件

---

## 🔧 开发指南

### 可用脚本

```bash
# 开发
pnpm dev          # 启动开发服务器 (HTTPS)
pnpm build        # 构建生产版本
pnpm start        # 启动生产服务器
pnpm lint         # 代码检查

# 数据库
pnpm prisma studio      # 打开数据库 GUI
pnpm prisma db push     # 同步 Schema
pnpm prisma migrate     # 创建迁移
```

### 代码规范

- ✅ TypeScript 严格模式
- ✅ ESLint + TypeScript Plugin
- ✅ 优先使用 Server Components
- ✅ 新功能遵循 Action-Service-Repository
- ✅ 所有用户文本需要国际化
- ✅ 组件复用设计系统和业务组件

### 目录约定

- `modules/` - 业务模块，每个模块包含：
  - `*-action.ts` - Server Actions
  - `*-service.ts` - 业务逻辑
  - `*-repository.ts` - 数据访问
  - `*-dto.ts` - 数据传输对象
- `components/` - 业务相关组件
- `design-system/` - 可复用基础组件
- `lib/` - 工具函数和库

---

## 🤝 贡献指南

我们欢迎各种贡献！

### 贡献流程

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add: AmazingFeature'`)
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

## 📄 许可证

本项目采用 [AGPL-3.0](./LICENSE) 许可证。

---

## 📞 联系方式

- **问题反馈**：[GitHub Issues](../../issues)
- **邮箱**：goddonebianu@outlook.com

---

<div align="center">

**如果这个项目对你有帮助，请给一个 ⭐️ Star！**

Made with ❤️ by the community

</div>
