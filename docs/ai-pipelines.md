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

TTS 不是管道, 而是独立的音频合成服务, 对接代码在 `src/lib/providers/tts.ts` (`"use server"`)。通过 **server action** 对外暴露, 不开放 HTTP 接口。

- **inference.sh OmniVoice** (`infsh/omnivoice`): 600+ 语言, 返回 WAV 24kHz。异步任务模型: `POST /run` → 轮询 `GET /tasks/:id` → 下载 `output.audio` 裸字符串 URL
- **语言**: OmniVoice 从 text 自动推导, 无需传 lang 参数
- **鉴权**: Bearer API Key (`inf_` 前缀), 存在 DB `system_config.services.tts.apiKey`, 仅服务端读取

### `synthesizeTts(text)` server action

唯一导出。调 inference.sh OmniVoice 合成音频, 返回 base64 编码的 WAV。客户端 `useAudioPlayer` hook 解码为 blob 后播放。**API Key 服务端从 DB 读取, 永不暴露给前端**。内部流程: 提交任务 → 轮询到完成 → 下载音频 → base64 编码 → 记审计日志 → 返回。

### 调用方

通过 `useAudioPlayer` hook 间接调用 `synthesizeTts`:
- dictionary/SpeakButton — `speak(text)`
- translator/page — `speak(text)`
- text-speaker/page — `speak(text)` + replay/speed/loop
- memorize/Memorize — `speak(text)` + replay/reset

TTS 调用收口在 `providers/tts.ts` server action + `useAudioPlayer` hook, 页面只调 `speak(text)`, 不接触凭据、URL 构建、音频解码。

## 共享依赖

> LLM/TTS/SMTP 等外部 API 对接代码统一收口在 `src/lib/providers/` (架构归属见 [architecture.md](./architecture.md)), 管道通过 `getAnswer()` / `synthesizeTts()` 调用。`bigmodel/` 仅保留管道编排逻辑 (orchestrator/types)。

| 文件 | 导出 | 用途                                     |
| -------------- | --------------------------- | ---------------------------------------- |
| `@/lib/providers/llm.ts` | `getAnswer(prompt)` | LLM API 封装 (直接 fetch, 含重试: 指数退避, 最多 2 次, 30s 超时) |
| `@/lib/providers/tts.ts` | `synthesizeTts(text)` | TTS server action (inference.sh OmniVoice, 600+ 语言, Bearer Key) |
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
