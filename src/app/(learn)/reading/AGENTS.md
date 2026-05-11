# 阅读理解页面

**生成时间:** 2026-05-11

## 概述

AI 驱动的阅读理解: 翻译长文本 + 逐句分词对齐 + 悬停高亮。Client Component 模式。

## 结构

```
reading/
├── page.tsx                 # Server: 渲染 ReadingClient
├── ReadingClient.tsx        # Client: 主页面 (180 行) — 输入表单 + 段落结果 + 翻译进度
├── reading-types.ts         # ParagraphData, HoverState 类型
└── components/
    ├── ParagraphView.tsx    # 分词对齐渲染 + 悬停高亮 (111 行)
    └── ReadingInputForm.tsx # 源文本/语言输入表单 (72 行)
```

## 数据流

```
用户输入文本 → actionReadText (Server Action)
  → reading-service → reading orchestrator (AI 管道)
    → 阶段 1: translateAndSplit (翻译+拆句)
    → 阶段 2: tokenizeAndAlignOne × N (逐句分词对齐, Promise.all)
  ← 返回 ParagraphData (sentences with tokens + alignments)
```

按段落逐个调用 `actionReadText`, 顺序处理 (非并行), 支持取消。

## WHERE TO LOOK

| 任务 | 位置 | 备注 |
|------|------|------|
| 修改输入表单 | components/ReadingInputForm.tsx | 源文本、语言选择 |
| 调整分词高亮 | components/ParagraphView.tsx | 悬停对齐、点击查词 |
| 修改 AI 管道 | src/lib/bigmodel/reading/orchestrator.ts | 翻译+分词对齐 |
| 修改业务逻辑 | src/modules/reading/ | action + service (无 repo) |
| 修改类型 | reading-types.ts | ParagraphData, HoverState |
| 调整 i18n | messages/*.json → "reading" namespace | 16 个 key |

## 约定

- 点击源语言 token → 打开 `/dictionary?q=word` 新标签页
- 支持翻转 (swap source/target)
- 段落为最小翻译单元, 逐段顺序处理
- i18n: `useTranslations("reading")`
