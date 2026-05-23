# COMPONENTS 知识库

**概述**

业务组件层。布局、关注系统、通用 UI 组件。非设计原语 (design-system/)，非页面专属组件 (随 page.tsx 放置)。

## 结构

```
components/
├── layout/
│   ├── Navbar.tsx          # Server, 主导航, capability 驱动链接显示
│   ├── NavSession.tsx      # Client, 登录态导航项 (UserLink, MobileMenuSession)
│   ├── MobileMenu.tsx      # Client, 响应式汉堡菜单
│   └── LanguageSettings.tsx # Client, 学习语言/UI 语言切换
├── follow/
│   ├── FollowButton.tsx    # Client, 关注/取关切换
│   ├── FollowStats.tsx     # Client, 粉丝/关注数 + 链接
│   └── UserList.tsx        # Client, 粉丝/关注列表
├── ui/
│   ├── PageLayout.tsx      # Server OK, 居中卡片/全宽/全屏变体
│   ├── PageHeader.tsx      # Server OK, 页面标题 + 副标题
│   ├── CardList.tsx        # Client, 牌组列表 + 收藏切换
│   ├── LanguageSelector.tsx # Client, 语言对下拉
│   └── LocaleSelector.tsx  # Client, UI 语言下拉
├── capability-hydrator.tsx # Client, Server→Client 能力注入 Zustand
└── theme-provider.tsx      # Client, CSS 自定义属性主题上下文
```

## 查找位置

| 任务 | 位置 | 备注 |
|------|------|------|
| 修改导航栏 | `layout/Navbar.tsx` | Server Component, 需 session 则委托 NavSession |
| 添加登录态 UI | `layout/NavSession.tsx` | 所有依赖 session 的导航项 |
| 关注功能 UI | `follow/` | FollowButton/FollowStats/UserList |
| 页面布局包装 | `ui/PageLayout.tsx` | 三种变体, 多数页面使用 |
| 语言选择 | `ui/LanguageSelector.tsx` | 学习语言对, 非界面语言 |
| 界面语言选择 | `ui/LocaleSelector.tsx` | UI locale, cookie 存储 |
| 能力注入 | `capability-hydrator.tsx` | Server 数据 → Zustand 客户端 |
| 主题切换 | `theme-provider.tsx` | CSS 变量 + localStorage |

## 约定

- 导入设计原语: `@/design-system/button`, `@/design-system/card` 等
- Server/Client: Navbar 是 Server, 需交互/状态/hooks 的用 Client
- 页面专属组件 (如 srt-player/components/) 不放此处, 随页面放置
- `capability-hydrator.tsx` 必须在 layout 层渲染, 确保客户端能力状态可用
- `theme-provider.tsx` 提供 CSS 变量上下文, 主题预设定义在 `@/shared/theme-presets`
