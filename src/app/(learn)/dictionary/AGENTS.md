# Dictionary 页面

## 概述

AI 词典查询页，两种模式: NormalMode (单词查询) 和 ReadingMode (逐词查词+存卡)。自有 Zustand store 管理查询状态。

## 结构

```
dictionary/
├── page.tsx                 # Server: 获取用户牌组，渲染 DictionaryClient
├── DictionaryClient.tsx     # Client (139 行): 模式切换，语言选择器，分发 Normal/Reading
├── NormalMode.tsx           # Client (224 行): 输入表单 + URL 同步 + 结果展示 + 存卡
├── ReadingMode.tsx          # Client (395 行): 逐词输入查词 + 查已有卡片 + 增删改卡
├── DictionaryEntry.tsx      # Client (35 行): 单词条展示 (音标/词性/释义/例句)
├── LanguageSelector.tsx     # Client (27 行): 适配层，转发到共享 LanguageSelector
├── constants.ts             # 重导出 POPULAR_LANGUAGES
└── stores/
    └── dictionaryStore.ts   # Zustand (138 行): query/语言对/搜索结果/loading，含 search/relookup/syncFromUrl
```

## 查找位置

| 任务                 | 位置                          | 备注                                         |
| -------------------- | ----------------------------- | -------------------------------------------- |
| 修改查询逻辑         | `stores/dictionaryStore.ts`   | `search()` 调用 `actionLookUpDictionary`     |
| 修改普通模式 UI      | `NormalMode.tsx`              | URL 参数驱动 (`?q=&ql=&dl=`)                 |
| 修改阅读模式 UI      | `ReadingMode.tsx`             | 独立状态，不共享 store 的 searchResult       |
| 修改词条展示样式     | `DictionaryEntry.tsx`         | 接收 `TSharedEntry`                          |
| 添加新查询模式       | 新建组件 + `DictionaryClient` | 在模式切换处添加新 tab                        |
| 修改 AI 词典管道     | `src/lib/bigmodel/dictionary/` | 2 阶段 orchestrator (preprocess + entries)  |
| 修改词典 action      | `src/modules/dictionary/`     | 仅 action + dto，无 service/repo (AI 驱动)   |
| 存卡逻辑             | `NormalMode.tsx` / `ReadingMode.tsx` | 调用 `actionCreateCard` / `actionUpdateCard` |
| i18n 翻译键          | `messages/*/dictionary`       | namespace: `dictionary`                      |

## 约定

### 模式切换

通过 URL 查询参数 `?mode=reading` 切换，不使用客户端 state。`DictionaryClient` 读取 `searchParams` 决定渲染哪个模式。

### Store 使用

- **NormalMode** 使用 `useDictionaryStore` 共享状态 (query/语言对/结果)
- **ReadingMode** 维护独立本地状态 (`readingSearchResult`)，不写入 store，但从 store 读取语言对
- `syncFromUrl()` 在 NormalMode 挂载时从 URL 参数恢复状态

### 卡片操作

- NormalMode: 仅 `actionCreateCard`，存整个 searchResult
- ReadingMode: 完整 CRUD (`actionGetCardByWord` → 判断创建/更新/删除)，支持覆盖确认

### 类型来源

- `TSharedEntry` / `TSharedItem` 来自 `@/shared/dictionary-type`
- 卡片类型来自 `@/modules/card/card-action-dto`

## 备注

- `constants.ts` 和 `LanguageSelector.tsx` 都重导出 `POPULAR_LANGUAGES`，后者同时包装共享组件
- ReadingMode 的逐词查词: 监听 input 的 `onChange`，当输入长度增加且以空格/标点结尾时触发查词
- ReadingMode 有 5 种处理状态: `idle` → `looking-up` → `saving` → `done` / `error`
- `relookup` 用于强制重新查询 (跳过可能的缓存)
- page.tsx 获取牌组列表传递给 Client，Client 挂载后再异步刷新 (处理登录态变化)
