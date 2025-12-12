# 多语言学习平台

一个基于 Next.js 构建的全功能多语言学习平台，提供翻译、发音、字幕播放、字母学习等多种语言学习工具，帮助用户更高效地掌握新语言。

## ✨ 主要功能

- **智能翻译工具** - 支持多语言互译，包含国际音标(IPA)标注
- **文本语音合成** - 将文本转换为自然语音，提高发音学习效果
- **SRT字幕播放器** - 结合视频字幕学习，支持多种字幕格式
- **字母学习模块** - 针对初学者的字母和发音基础学习
- **记忆强化工具** - 通过科学记忆法巩固学习内容
- **个人学习空间** - 用户可以创建、管理和组织自己的学习资料

## 🛠 技术栈

### 前端框架
- **Next.js 16** - React 全栈框架，使用 App Router
- **React 19** - 用户界面构建
- **TypeScript** - 类型安全的 JavaScript
- **Tailwind CSS** - 实用优先的 CSS 框架

### 数据与后端
- **PostgreSQL** - 主数据库
- **Prisma** - 现代数据库工具包和 ORM
- **better-auth** - 安全的身份验证系统

### 国际化与辅助功能
- **next-intl** - 国际化解决方案
- **edge-tts-universal** - 跨平台文本转语音

### 开发工具
- **ESLint** - 代码质量检查
- **pnpm** - 高效的包管理器

## 📁 项目结构

```
src/
├── app/                   # Next.js App Router 路由
│   ├── (features)/       # 功能模块路由
│   ├── api/              # API 路由
│   └── auth/             # 认证相关页面
├── components/           # React 组件
│   ├── buttons/          # 按钮组件
│   ├── cards/            # 卡片组件
│   └── ...
├── lib/                  # 工具函数和库
│   ├── actions/          # Server Actions
│   ├── browser/          # 浏览器端工具
│   └── server/           # 服务器端工具
├── hooks/                # 自定义 React Hooks
├── i18n/                 # 国际化配置
└── config/               # 应用配置
```

## 🚀 快速开始

### 环境要求

- Node.js 24
- PostgreSQL 数据库
- pnpm (推荐) 或 npm

### 本地开发

1. 克隆项目
```bash
git clone <repository-url>
cd learn-languages
```

2. 安装依赖
```bash
pnpm install
```

3. 设置环境变量

从项目提供的示例文件复制环境变量模板：

```bash
cp .env.example .env.local
```

然后编辑 `.env.local` 文件，配置所有必要的环境变量：

```env
// LLM
ZHIPU_API_KEY=your-zhipu-api-key
ZHIPU_MODEL_NAME=your-zhipu-model-name

// Auth
BETTER_AUTH_SECRET=your-better-auth-secret
BETTER_AUTH_URL=http://localhost:3000
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

// Database
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
```

注意：所有带 `your-` 前缀的值需要替换为你的实际配置。

4. 初始化数据库
```bash
pnpm prisma generate
pnpm prisma db push
```

5. 启动开发服务器
```bash
pnpm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📚 API 文档

### 认证系统

应用使用 better-auth 提供安全的用户认证系统，支持邮箱/密码登录和第三方登录。

### 数据模型

核心数据模型包括：
- **User** - 用户信息
- **Folder** - 学习资料文件夹
- **Pair** - 语言对（翻译对、词汇对等）

详细模型定义请参考 [prisma/schema.prisma](./prisma/schema.prisma)

## 🌍 国际化

应用支持多语言，当前语言文件位于 `messages/` 目录。添加新语言：

1. 在 `messages/` 目录创建对应语言的 JSON 文件
2. 在 `src/i18n/config.ts` 中添加语言配置

## 🤝 贡献指南

我们欢迎各种形式的贡献！请遵循以下步骤：

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 AGPL-3.0 许可证 - 查看 [LICENSE](./LICENSE) 文件了解详情。

## 📞 支持

如果您遇到问题或有建议，请通过以下方式联系：

- 提交 [Issue](../../issues)
- 发送邮件至 [goddonebianu@outlook.com]

---

**Happy Learning!** 🌟
