# 功能页详解

复杂功能页的详细结构。简单页 (translator/text-speaker/alphabet/explore/favorites/memorize) 参见 [pages.md](./pages.md) 的路由组和数据流说明。

## Decks 牌组管理

牌组 CRUD + 卡片拖拽排序 + 多 Modal 表单。项目最复杂的独立功能页,双层级 Server→Client 委托。

### 结构

```
src/app/(learn)/decks/
├── page.tsx                 # Server: getCurrentUserId → DecksClient (16 行)
├── DecksClient.tsx          # Client: 牌组列表 (440 行) - 创建/删除/编辑牌组, 拖拽排序, 公开/私有切换
└── [deck_id]/
    ├── page.tsx             # Server: actionGetDeckById → 所有权/可见性校验 → InDeck (46 行)
    ├── InDeck.tsx           # Client: 牌组详情 (286 行) - 卡片列表, 拖拽排序, 批量删除, 删除牌组
    ├── CardItem.tsx         # Client: 卡片条目 (130 行) - 拖拽手柄, 正反面展示, 删除确认, 编辑入口
    ├── AddCardModal.tsx     # Client: 添加卡片 (269 行) - 多释义动态表单, 卡片类型选择, IPA
    └── EditCardModal.tsx    # Client: 编辑卡片 (209 行) - 预填表单, meanings 动态增删
```

### 查找位置

| 任务               | 位置                              | 备注                                              |
| ------------------ | --------------------------------- | ------------------------------------------------- |
| 牌组 CRUD          | `src/modules/deck/deck-action.ts` | 13 个 actions, 344 行 repository                  |
| 卡片 CRUD + 排序   | `src/modules/card/card-action.ts` | 8 个 actions, 包 reorderCards                     |
| 牌组拖拽排序       | `DecksClient.tsx` SortableDeckCard | @dnd-kit, actionReorderDecks                     |
| 卡片拖拽排序       | `InDeck.tsx` SortableCardItem     | @dnd-kit, actionReorderCards, sortOrder 字段      |
| 卡片类型           | `@/modules/card/card-action-dto`  | CardType: WORD/PHRASE/SENTENCE, CardMeaning 接口  |
| 卡片表单 (添加)    | `AddCardModal.tsx`                | meanings 动态增删, IPA 仅 WORD/PHRASE 显示        |
| 卡片表单 (编辑)    | `EditCardModal.tsx`               | useEffect 预填 card 数据                          |
| 删除确认           | `CardItem.tsx` / `InDeck.tsx`     | 内联确认 UI, 非 Modal                             |
| 公开牌组访问       | `[deck_id]/page.tsx`              | isOwner + isPublic 校验, isReadOnly 传递给子组件  |
| i18n               | `useTranslations("decks")`        | DecksClient; 其余用 `"deck_id"` namespace         |
| 牌组收藏           | `deck-action.ts`                  | actionToggleDeckFavorite / actionCheckDeckFavorite |

### 拖拽排序 (核心特性)

两层拖拽均使用 @dnd-kit: DndContext + SortableContext + useSortable。

- **牌组排序**: DecksClient 内嵌 SortableDeckCard, GripVertical 手柄, dragEnd 调用 actionReorderDecks
- **卡片排序**: InDeck 内嵌 SortableCardItem, 传递 dragHandleProps 给 CardItem, dragEnd 调用 actionReorderCards
- 排序字段: `sortOrder` (数据库字段)
- isReadOnly 时隐藏拖拽手柄, 禁止排序

### Server→Client 双层委托

```
/decks:
  page.tsx (Server: userId 校验 + redirect)
  → DecksClient (Client: 数据获取 + 全部 UI)

/decks/[deck_id]:
  page.tsx (Server: 权限校验 + generateMetadata)
  → InDeck (Client: 数据获取 + 拖拽 + Modal 管理)
    → CardItem → EditCardModal / 删除确认
    → AddCardModal (由 InDeck 控制开关)
```

### 备注

- DecksClient 和 InDeck 各自管理数据获取 (useState + useEffect), 非服务端预取
- CardItem 的删除确认是内联展开式, 不是 Modal
- 使用 `@/design-system/modal` 复合组件: Modal.Header / Modal.Title / Modal.Body / Modal.Footer
- explore 和 favorites 页面复用 deck-action 的公开/收藏查询 actions
- 牌组 visibility: PUBLIC | PRIVATE, 公开牌组可被其他用户浏览 (explore 路由)

---

## Dictionary 词典

AI 词典查询页,两种模式: NormalMode (单词查询) 和 ReadingMode (逐词查词+存卡)。自有 Zustand store 管理查询状态。

### 结构

```
dictionary/
├── page.tsx                 # Server: 获取用户牌组,渲染 DictionaryClient
├── DictionaryClient.tsx     # Client (139 行): 模式切换,语言选择器,分发 Normal/Reading
├── NormalMode.tsx           # Client (224 行): 输入表单 + URL 同步 + 结果展示 + 存卡
├── ReadingMode.tsx          # Client (395 行): 逐词输入查词 + 查已有卡片 + 增删改卡
├── DictionaryEntry.tsx      # Client (35 行): 单词条展示 (音标/词性/释义/例句)
├── LanguageSelector.tsx     # Client (27 行): 适配层,转发到共享 LanguageSelector
├── constants.ts             # 重导出 POPULAR_LANGUAGES
└── stores/
    └── dictionaryStore.ts   # Zustand (138 行): query/语言对/搜索结果/loading,含 search/relookup/syncFromUrl
```

### 约定

- **模式切换**: URL 查询参数 `?mode=reading`,不使用客户端 state。DictionaryClient 读取 searchParams 决定渲染
- **Store**: NormalMode 使用 `useDictionaryStore` 共享状态;ReadingMode 维护独立本地状态,但从 store 读取语言对。`syncFromUrl()` 挂载时从 URL 恢复状态
- **卡片操作**: NormalMode 仅 `actionCreateCard`;ReadingMode 完整 CRUD (`actionGetCardByWord` → 判断创建/更新/删除),支持覆盖确认
- **ReadingMode 逐词查词**: 监听 input 的 `onChange`,输入长度增加且以空格/标点结尾时触发查词;5 种状态 `idle` → `looking-up` → `saving` → `done` / `error`
- 类型 `TSharedEntry` / `TSharedItem` 来自 `@/shared/dictionary-type`;AI 管道见 [ai-pipelines.md](./ai-pipelines.md)

---

## SRT 字幕播放器

自包含的字幕播放页面,全部在路由目录内,无外部依赖。使用 Zustand 管理状态,实时同步视频与字幕。

### 结构

```
srt-player/
├── page.tsx                 # 主页面 (194 行) — 文件上传 + 播放器编排
├── types.ts                 # 类型定义 + selectors (128 行)
├── components/
│   ├── ControlPanel.tsx     # 控制/设置面板 (333 行) [当前未被使用]
│   ├── SubtitleProgressBar.tsx  # 进度条 (94 行)
│   └── VideoPlayerPanel.tsx # 视频容器 (68 行) [当前未被使用]
├── hooks/
│   ├── useFileUpload.ts     # 视频/字幕文件上传 (80 行)
│   ├── useKeyboardShortcuts.ts  # 快捷键 (82 行)
│   ├── useSubtitleSync.ts   # 字幕同步 + 自动暂停 (101 行)
│   └── useVideoSync.ts      # 视频事件同步 (44 行)
├── stores/
│   └── srtPlayerStore.ts    # Zustand store (216 行)
└── utils/
    └── subtitleParser.ts    # SRT 解析 + 时间工具 (89 行)
```

> `VideoPlayerPanel.tsx` 和 `ControlPanel.tsx` 当前未被 `page.tsx` 使用,page.tsx 直接内联实现了所有 UI。这两个组件是独立替代方案, 可能用于未来重构。

### 约定

- **全部 "use client"**: 整个目录树无 Server Component。文件通过 `URL.createObjectURL()` 本地加载,不上传服务器,限制 1GB
- **Zustand Store**: `srtPlayerStore.ts` 管理所有状态 (视频 URL、字幕数据、播放状态、速率、自动暂停),通过 `selectors` 对象暴露派生状态 (`canPlay`, `currentSubtitle`, `progress`)。Store 直接持有 `videoRef` (DOM 元素引用)
- **自动暂停机制**: `useSubtitleSync` 计算精确暂停时机 — 补偿播放速率,提前 0.15s 触发,通过 `setTimeout` 调度
- **字幕点击查词**: 当前字幕文本按空格分词,每个词链接到 `/dictionary?q=word`
- **i18n**: `useTranslations("home")` + `useTranslations("srt_player")`
- **完全自包含**: 不依赖 src/modules/, 不依赖服务端数据

---

## Reading 阅读理解

AI 驱动的阅读理解: 翻译长文本 + 逐句分词对齐 + 悬停高亮。Client Component 模式。

### 结构

```
reading/
├── page.tsx                 # Server: 渲染 ReadingClient
├── ReadingClient.tsx        # Client: 主页面 (180 行) — 输入表单 + 段落结果 + 翻译进度
├── reading-types.ts         # ParagraphData, HoverState 类型
└── components/
    ├── ParagraphView.tsx    # 分词对齐渲染 + 悬停高亮 (111 行)
    └── ReadingInputForm.tsx # 源文本/语言输入表单 (72 行)
```

### 数据流

```
用户输入文本 → actionReadText (Server Action)
  → reading-service → reading orchestrator (AI 管道, 见 ai-pipelines.md)
    → 阶段 1: translateAndSplit (翻译+拆句)
    → 阶段 2: tokenizeAndAlignOne × N (逐句分词对齐, Promise.all)
  ← 返回 ParagraphData (sentences with tokens + alignments)
```

按段落逐个调用 `actionReadText`, 顺序处理 (非并行), 支持取消。

### 约定

- 点击源语言 token → 打开 `/dictionary?q=word` 新标签页
- 支持翻转 (swap source/target)
- 段落为最小翻译单元, 逐段顺序处理
- i18n: `useTranslations("reading")` (16 个 key)
