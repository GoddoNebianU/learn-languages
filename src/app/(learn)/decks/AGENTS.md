# Decks 牌组管理

**生成时间:** 2026-06-01

## 概述

牌组 CRUD + 卡片拖拽排序 + 多 Modal 表单。项目最复杂的独立功能页，双层级 Server→Client 委托。

## 结构

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

## 查找位置

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

## 约定

### 拖拽排序 (核心特性)

两层拖拽均使用 @dnd-kit: DndContext + SortableContext + useSortable。

- **牌组排序**: DecksClient 内嵌 SortableDeckCard, GripVertical 手柄, dragEnd 调用 actionReorderDecks
- **卡片排序**: InDeck 内嵌 SortableCardItem, 传递 dragHandleProps 给 CardItem, dragEnd 调用 actionReorderCards
- 排序字段: `sortOrder` (数据库字段, 迁移 add_sort_order)
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

### Modal 模式

使用 `@/design-system/modal` 复合组件: Modal.Header / Modal.Title / Modal.Body / Modal.Footer。AddCardModal 和 EditCardModal 由父组件通过 isOpen/onClose 控制。

### 卡片数据结构

```typescript
// CardMeaning: { partOfSpeech: string | null, definition: string, example: string | null }
// 卡片可包含多个 meaning, AddCardModal/EditCardModal 动态增删 meaning 行
```

## 备注

- DecksClient 和 InDeck 各自管理数据获取 (useState + useEffect), 非服务端预取
- CardItem 的删除确认是内联展开式, 不是 Modal
- [deck_id]/page.tsx 使用 getTranslations("deck_id") 做 generateMetadata 的备选
- explore 和 favorites 页面复用 deck-action 的公开/收藏查询 actions
- 牌组 visibility: PUBLIC | PRIVATE, 公开牌组可被其他用户浏览 (explore 路由)
