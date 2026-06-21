# 页面架构

26 个页面, 1 个 API 路由, 3 个路由组 + 1 个管理路由, 单一根 layout。4 种渲染模式。9 个路由段有 loading.tsx (Skeleton 骨架屏), 4 个 error.tsx (根级 + dictionary/reading/translator)。

## 路由组

```
src/app/
├── layout.tsx          # 唯一根 layout (ThemeProvider + NextIntlClientProvider + CapabilityHydrator + Navbar + Toaster)
├── page.tsx            # 首页 (Server Component)
├── error.tsx           # 根级错误边界 (Client Component)
├── not-found.tsx       # 404 页面
├── api/auth/[...all]/  # 唯一 API 路由 (better-auth catch-all, 单用户模式返回 404)
├── admin/              # 管理后台 (独立认证) — 详见 config-system.md
├── (auth)/             # 认证路由组
│   ├── login/          # 登录 (Client)
│   ├── signup/         # 注册 (Client)
│   ├── logout/         # 登出 (Server, 直接调用 auth.api.signOut)
│   ├── forgot-password/# 忘记密码 (Client)
│   ├── reset-password/ # 重置密码 (Client)
│   └── users/[username]/ # 用户资料 (Server) + following/ + followers/
├── (account)/          # 账户路由组
│   ├── profile/        # 重定向到 /users/{username} 或 /decks
│   └── settings/       # 设置 (Client, 主题切换)
└── (learn)/            # 功能路由组
    ├── translator/     # 翻译 (Client, 401 行单体)
    ├── dictionary/     # 词典 (Server→Client) — 详见 features.md
    ├── srt-player/     # 字幕播放器 (Client, 自含子模块) — 详见 features.md
    ├── text-speaker/   # 语音播放 (Client, 453 行)
    ├── alphabet/       # 字母学习 (Server Component 读 JSON → AlphabetClient 交互)
    ├── explore/        # 公开牌组 (Server→Client) + [id]/ 详情
    ├── favorites/      # 收藏 (Server→Client)
    ├── decks/          # 牌组管理 (Server→Client) + [deck_id]/ 详情 — 详见 features.md
    ├── memorize/       # 记忆模式 (Server→Client, ?deck_id=xxx)
    └── reading/        # 阅读理解 (Client, AI 翻译+分词对齐) — 详见 features.md
```

> 功能页 (decks/dictionary/srt-player/reading) 详细结构见 [features.md](./features.md)。

## 4 种渲染模式

### 模式 1: 纯 Client Component (8 页)

页面标记 `"use client"`, 所有逻辑在客户端处理。

- translator, srt-player, text-speaker (高频交互)
- login, signup, forgot-password, reset-password (表单)
- settings

### 模式 2: Server→Client 委托 (9 页) — 最常用

Server page 获取数据, 传给同目录的 Client 子组件。

```
route/
  page.tsx          # Server: getCurrentUserId() + actionGetData()
  SomeClient.tsx    # Client: 接收 initialData prop
```

适用页面: dictionary, explore, explore/[id], favorites, decks, decks/[deck_id], memorize, reading, alphabet

### 模式 3: 纯 Server Component (4 页)

完全在服务端渲染, 无客户端交互。

- 首页, 用户资料, following, followers

### 模式 4: 重定向/操作 (3 页)

执行操作后重定向。

- logout (signOut→redirect /login)
- profile (redirect /users/{username})
- not-found

## 同目录组件约定

页面专用 Client 组件放在同目录下, 不提取到 `src/components/`:

- `decks/[deck_id]/`: InDeck, CardItem, AddCardModal, EditCardModal
- `dictionary/`: DictionaryClient, DictionaryEntry
- `explore/`: ExploreClient; `explore/[id]/`: ExploreDetailClient
- `memorize/`: Memorize
- `text-speaker/`: SaveList
- `users/[username]/`: DeleteAccountButton

命名: `{Feature}Client.tsx` (列表页) 或 `{Feature}.tsx` (功能组件)

## 认证保护模式

页面级认证两种写法:

- **Server Page/Action**: 调 `getCurrentUserId()` (`@/modules/shared/action-utils`),未认证时 `redirect("/login")`
- **Client Page**: `authClient.useSession()` 获取登录态

> `getCurrentUserId()` 的机制 (single/multi 模式) 及单用户模式下的页面行为 (auth 页面 404、Navbar 始终登录态) 详见 [config-system.md](./config-system.md#认证模式)。

## i18n Namespace 映射

| Namespace | 页面 |
|-----------|------|
| `home` | 首页, srt-player |
| `auth` | login, signup, forgot-password, reset-password |
| `translator` | translator |
| `dictionary` | dictionary |
| `srt_player` | srt-player |
| `text_speaker` | text-speaker |
| `alphabet` | alphabet |
| `explore` | explore |
| `exploreDetail` | explore/[id] |
| `favorites` | favorites |
| `decks` | decks |
| `deck_id` | decks/[deck_id] |
| `memorize` | memorize |
| `memorize.deck_selector`, `memorize.review` | memorize (嵌套 namespace) |
| `user_profile` | users/[username] |
| `follow` | following, followers |
| `settings` | settings |
| `navbar` | Navbar (全局) |

## 共享 UI 组件

| 组件 | 消费者 |
|------|--------|
| PageLayout + PageHeader | 几乎所有 (learn) 页面 |
| CardList | explore, favorites, decks |
| LanguageSelector | translator, dictionary |
| LocaleSelector | Navbar |

> 组件详情见 [components.md](./components.md)。

## 关键数据流

### 牌组详情页 (decks/[deck_id])

Server page: `getCurrentUserId` → `actionGetDeckById` → `InDeck(deckId, isReadOnly)`
InDeck: `actionGetCardsByDeckId` → 渲染 CardItem 列表 → AddCardModal/EditCardModal

### 记忆模式 (memorize)

Server page: `getCurrentUserId` → `actionGetDeckById` → `Memorize(deckId, deckName)`
Memorize: `actionGetCardsByDeckId` → 多种复习模式 (顺序/随机/无限/听写)
卡片字段: 正面 (word + IPA) / 翻面 (词性 + 释义 + 例句, 例句可选)

### 公开探索 (explore)

Server page: `actionGetPublicDecks` → `ExploreClient(initialPublicDecks)`
ExploreClient: `actionSearchPublicDecks` (搜索), `actionToggleDeckFavorite` (收藏)
