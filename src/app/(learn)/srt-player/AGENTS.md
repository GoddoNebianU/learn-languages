# SRT 字幕播放器

**生成时间:** 2026-05-11

## 概述

自包含的字幕播放页面，全部在路由目录内，无外部依赖。使用 Zustand 管理状态，实时同步视频与字幕。

## 结构

```
srt-player/
├── page.tsx                 # 主页面 (194 行) — 文件上传 + 播放器编排
├── types.ts                 # 类型定义 + selectors (128 行)
├── components/
│   ├── ControlPanel.tsx     # 控制/设置面板 (333 行)
│   ├── SubtitleProgressBar.tsx  # 进度条 (94 行)
│   └── VideoPlayerPanel.tsx # 视频容器 (68 行)
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

## 未使用组件

`VideoPlayerPanel.tsx` 和 `ControlPanel.tsx` 当前未被 `page.tsx` 使用。`page.tsx` 直接内联实现了所有 UI。这两个组件是从同一 Zustand store 读取的独立替代方案, 可能用于未来重构。

## WHERE TO LOOK

| 任务 | 位置 | 备注 |
|------|------|------|
| 添加播放器功能 | stores/srtPlayerStore.ts | 状态集中管理 |
| 修改字幕解析 | utils/subtitleParser.ts | 仅支持 .srt 格式 |
| 调整同步精度 | hooks/useSubtitleSync.ts | 自动暂停提前 0.15s |
| 添加 UI 控制 | components/ControlPanel.tsx | 所有控制逻辑 |
| 修改类型定义 | types.ts | SubtitleData, selectors |
| 了解未使用的重构组件 | components/VideoPlayerPanel.tsx, components/ControlPanel.tsx | 未被 page.tsx 引用 |

## 约定

### 全部 "use client"

整个目录树无 Server Component。文件通过 `URL.createObjectURL()` 本地加载，不上传服务器，限制 1GB。

### Zustand Store

`srtPlayerStore.ts` 管理所有状态: 视频 URL、字幕数据、播放状态、速率、自动暂停。通过 `selectors` 对象暴露派生状态 (`canPlay`, `currentSubtitle`, `progress`)。

Store 直接持有 `videoRef` (DOM 元素引用)，通过 `setVideoRef()` 设置。

### 自动暂停机制

`useSubtitleSync` 计算精确暂停时机:
- 补偿播放速率 (`playbackRate`)
- 提前 0.15s 触发暂停
- 通过 `setTimeout` 调度

### 字幕点击查词

当前字幕文本按空格分词，每个词链接到 `/dictionary?q=word`。

## i18n

使用两个 namespace: `useTranslations("home")` + `useTranslations("srt_player")`。

## 外部依赖

- Zustand (状态管理)
- Lucide React (图标)
- `@/hooks/useAudioPlayer` (未使用, 有本地替代)
- `@/config/images` (未使用, 有本地内联 SVG)
- 完全自包含: 不依赖 src/modules/, 不依赖服务端数据
