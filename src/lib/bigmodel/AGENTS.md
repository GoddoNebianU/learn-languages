# AI 管道架构指南

**生成时间:** 2026-04-29

## 概述

AI 处理采用多阶段管道路径, 由 orchestrator 协调各 stage 执行。3 个管道 + 1 个独立服务。

## 管道清单

| 管道       | 阶段数 | LLM 调用 | 状态      | 用途                      |
| ---------- | ------ | -------- | --------- | ------------------------- |
| dictionary | 2      | 2        | ✅ 使用中 | 输入预处理 → 词条生成     |
| translator | 3      | 2-4      | ✅ 使用中 | 语言检测 → 翻译 → 可选IPA |
| ocr        | 1      | 1        | ⚠️ 未使用 | 图片词汇提取 (GLM-4.6V)   |

## 管道详情

### dictionary (2 阶段, 从 4 阶段合并)

```
dictionary/
├── orchestrator.ts           # 编排 2 个阶段
├── types.ts                  # PreprocessResult, EntriesGenerationResult, DictionaryContext
├── stage1-preprocess.ts      # 输入分析 + 语义映射 + 标准形式 (1 LLM 调用)
└── stage4-entriesGeneration.ts  # 词条生成 (1 LLM 调用) [文件名保留旧编号]
```

- **调用者**: `dictionary-action.ts` 直接调用 `executeDictionaryLookup` (无 service 层)
- **错误处理**: 自定义 `LookUpError`, 验证 LLM 输出字段完整性
- **注意**: 文件名 `stage4-` 是历史遗留, 实际是第 2 阶段

### translator (3 阶段, 全部内联在 orchestrator.ts)

```
translator/
├── orchestrator.ts   # 3 个阶段全部内联
└── types.ts          # LanguageDetectionResult, TranslationLLMResponse
```

- **阶段 1**: detectLanguage() — 语言检测 (1 LLM 调用)
- **阶段 2**: performTranslation() — 核心翻译 (1 LLM 调用)
- **阶段 3** (可选): generateIPA() — IPA 音标, Promise.all 并行 (2 LLM 调用)
- **调用者**: `translator-service.ts` 调用 `executeTranslation`
- **IPA 失败优雅降级**: 返回空字符串而非抛出错误

### ocr (1 阶段, 未使用)

```
ocr/
├── orchestrator.ts   # executeOCR — 视觉模型分析图片
└── types.ts          # OCRInput, OCROutput, VocabularyPair
```

- **模型**: GLM-4.6V (视觉模型), 使用 OpenAI SDK 直接调用 (唯一不用 getAnswer 的管道)
- **状态**: 已实现但零调用者
- **功能**: 从图片中提取词汇-释义对

## 独立服务: TTS

`tts.ts` 不是管道, 而是独立的 TTS 服务类:

- **API**: 阿里云 DashScope (qwen3-tts-flash)
- **方法**: `getTTSUrl(text, voice)` → 返回音频 URL
- **调用者**: translator/page, text-speaker/page, Memorize (直接从页面组件调用)
- **错误处理**: 捕获错误, 日志记录, 返回 `"error"` 字符串

## 共享依赖

| 文件           | 导出                        | 用途                                     |
| -------------- | --------------------------- | ---------------------------------------- |
| `llm.ts`       | `getAnswer(prompt)`         | Zhipu AI 聊天补全 API 封装 (含重试: 指数退避, 最多 2 次) |
| `tts.ts`       | `getTTSUrl(text, voice)`    | TTS 服务                                 |
| `@/utils/json` | `parseAIGeneratedJSON<T>()` | 解析 AI 返回的 JSON (含 markdown 代码块) |
| `@/lib/errors` | `LookUpError`               | 词典管道专用错误类                       |
| `@/lib/logger` | `createLogger()`            | 所有管道文件使用                         |

## 阶段命名约定

```typescript
// 函数: 动词+名词
async function analyzeInput(text: string): Promise<InputAnalysisResult>
async function generateEntries(...): Promise<EntriesResult>

// 结果接口: 动词+名词+Result
interface InputAnalysisResult { ... }
```

## 添加新管道

1. 创建目录 `src/lib/bigmodel/{name}/`
2. 创建 `types.ts` 定义阶段间传递的接口
3. 创建 `stage{n}-{name}.ts` 实现各阶段 (或内联在 orchestrator)
4. 创建 `orchestrator.ts` 编排调用顺序
5. 在 Service 或 Action 层调用 orchestrator
6. 使用 `getAnswer()` 调用 LLM, `parseAIGeneratedJSON()` 解析响应

## AI 响应解析

```typescript
import { parseAIGeneratedJSON } from "@/utils/json";
const result = parseAIGeneratedJSON<ExpectedType>(aiResponseString);
```
