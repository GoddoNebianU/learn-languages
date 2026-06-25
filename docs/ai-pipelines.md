# AI 管道

AI 处理采用多阶段管道路径, 由 orchestrator 协调各 stage 执行。位于 `src/lib/bigmodel/`。3 个管道 + 1 个独立服务。

## 管道清单

| 管道       | 阶段数 | LLM 调用 | 状态      | 用途                      |
| ---------- | ------ | -------- | --------- | ------------------------- |
| dictionary | 2      | 2        | 使用中    | 输入预处理 → 词条生成     |
| translator | 3      | 2-4      | 使用中    | 语言检测 → 翻译 → 可选IPA |
| reading    | 2      | 1+N      | 使用中    | 翻译拆句 → 逐句分词对齐   |

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

### reading (2 阶段)

```
reading/
├── orchestrator.ts   # 2 个阶段全部内联 (186 行)
└── types.ts          # ReadingResult, SentencePair, Token, Alignment, Stage1/2Response
```

- **阶段 1**: translateAndSplit() — 翻译源文本并按句子拆分为一一对应的句子对 (1 LLM 调用)
- **阶段 2**: tokenizeAndAlignOne() × N — 对每个句子对进行分词和逐词对齐 (N 次 LLM 调用, Promise.all 并行)
- **调用者**: `reading-service.ts` 调用 `executeReadingTranslation`
- **特点**: XML 转义源文本防注入, 细粒度 1:1 对齐, 虚词/助词可合并

## 独立服务: TTS

TTS 不是管道, 而是独立的音频合成服务, 对接代码在 `src/lib/providers/tts.ts`。采用**单层**结构: 仅对接 inference.sh 托管的 OmniVoice (`infsh/omnivoice`, 支持 600+ 语言), 返回 wav (24kHz) 音频, 走 Bearer API Key 鉴权。

- **Primary (inference.sh OmniVoice)**: inference.sh 托管的 TTS 应用 (`infsh/omnivoice`), 返回 wav 音频, 走 Bearer API Key 鉴权。异步任务模型: `POST /run` 立即返回 task id → 轮询 `GET /tasks/:id` 到 status=10 → `output.audio` 是裸字符串 URL (WAV 24kHz), 二次 GET 下载
- **lang 参数**: 保留兼容性但 OmniVoice 不使用 — 语言由 text 自动推导 (支持 600+ 语言)

### `providers/tts.ts` 导出

- `getTTSUrl(text, lang, regenerate = false)` — 对外入口。若 primary 已配置 (apiKey 非空) → 返回 `/api/tts?text=&lang=` (代理路由); 否则 → 返回 null。`regenerate` 为 true 时追加 `&_t=` 时间戳绕过缓存
- `fetchPrimaryTtsAudio(text, lang?)` — 调 inference.sh OmniVoice (Bearer Key): `POST /run` 提交 → 轮询 `GET /tasks/:id` → 下载 `output.audio` 字符串 URL, 返回 wav 音频

### `/api/tts` 代理路由 (`src/app/api/tts/route.ts`)

`GET /api/tts?text=&lang=`。调 inference.sh OmniVoice 取 wav 返回客户端。**API Key 服务端从 DB 读取, 永不暴露给前端**。

### 调用与错误处理

- **调用者**: translator/page, text-speaker/page, memorize/Memorize, dictionary/SpeakButton (直接从页面组件调用 `getTTSUrl`)
- **错误处理**: 捕获错误, 日志记录, 返回 `"error"` 字符串

TTS 直接从页面组件调用 (不经过 action 层),因为 TTS 返回音频 URL, 不涉及数据库操作, 无需 action-service-repository 层。凭据调度收口在 `/api/tts` 代理 + `providers/tts.ts`, 页面只拿 URL。

## 共享依赖

> LLM/TTS/SMTP 等外部 API 对接代码统一收口在 `src/lib/providers/` (架构归属见 [architecture.md](./architecture.md)), 管道通过 `getAnswer()` / `getTTSUrl()` 调用。`bigmodel/` 仅保留管道编排逻辑 (orchestrator/types)。

| 文件 | 导出 | 用途                                     |
| -------------- | --------------------------- | ---------------------------------------- |
| `@/lib/providers/llm.ts` | `getAnswer(prompt)` | LLM API 封装 (直接 fetch, 含重试: 指数退避, 最多 2 次, 30s 超时) |
| `@/lib/providers/tts.ts` | `getTTSUrl` / `fetchPrimaryTtsAudio` | TTS 服务 (inference.sh OmniVoice, 600+ 语言, Bearer Key) |
| `@/utils/json` | `parseAIGeneratedJSON<T>()` | 解析 AI 返回的 JSON (含 markdown 代码块) |
| `@/lib/errors` | `LookUpError`               | 词典管道专用错误类                       |
| `@/lib/logger` | `createLogger()`            | 所有管道文件使用                         |

## "use server" 类型限制

`providers/llm.ts` 和 `providers/tts.ts` 标记了 `"use server"`, Turbopack 在运行时无法正确擦除 `type` 别名。

- **内联类型** (`providers/llm.ts`): 禁止使用 `type` 别名 (`type Messages = ...`) 和 `export type {}`, 所有类型直接内联

违反会导致运行时 `ReferenceError: Xxx is not defined`。`providers/tts.ts` 仅使用内联的原始类型 (`string` 等), 不涉及 `type` 别式。

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
