# AI 管道架构指南

**生成时间:** 2026-03-08

## 概述

AI 处理采用多阶段管道路径，由 orchestrator 协调各 stage 执行。

## 结构

```
{name}/
├── orchestrator.ts      # 协调器：编排所有阶段
├── types.ts             # 共享接口定义
├── stage1-{name}.ts     # 阶段 1
├── stage2-{name}.ts     # 阶段 2
└── ...
```

## 现有管道

| 管道 | 阶段数 | 用途 |
|------|--------|------|
| dictionary | 4 | 词典查询（输入分析→语义映射→标准形式→词条生成）|
| translator | 1 | 翻译处理 |

## 阶段命名约定

```typescript
// 函数命名：动词+名词
async function analyzeInput(text: string): Promise<InputAnalysisResult>
async function determineSemanticMapping(...): Promise<SemanticMappingResult>
async function generateStandardForm(...): Promise<StandardFormResult>
async function generateEntries(...): Promise<EntriesResult>

// 结果接口命名：动词+名词+Result
interface InputAnalysisResult {
  language: string;
  normalizedText: string;
}
```

## Orchestrator 模板

```typescript
// orchestrator.ts
import { analyzeInput } from "./stage1-inputAnalysis";
import { determineSemanticMapping } from "./stage2-semanticMapping";
import { generateStandardForm } from "./stage3-standardForm";
import { generateEntries } from "./stage4-entriesGeneration";

export async function orchestrateDictionaryLookup(text: string, queryLang: string, defLang: string) {
  // 阶段 1：输入分析
  const analysis = await analyzeInput(text, queryLang);
  
  // 阶段 2：语义映射
  const mapping = await determineSemanticMapping(analysis);
  
  // 阶段 3：标准形式
  const standard = await generateStandardForm(mapping, defLang);
  
  // 阶段 4：词条生成
  const entries = await generateEntries(standard);
  
  return entries;
}
```

## AI 响应解析

```typescript
import { parseAIGeneratedJSON } from "@/utils/json";

// AI 返回的 JSON 可能包含 markdown 代码块，用此函数解析
const result = parseAIGeneratedJSON<ExpectedType>(aiResponseString);
```

## 添加新管道

1. 创建目录 `src/lib/bigmodel/{name}/`
2. 创建 `types.ts` 定义阶段间传递的接口
3. 创建 `stage{n}-{name}.ts` 实现各阶段
4. 创建 `orchestrator.ts` 编排调用顺序
5. 在 Service 层调用 orchestrator

## 依赖

- `@/lib/bigmodel/zhipu.ts` — 智谱 AI 客户端
- `@/lib/bigmodel/tts.ts` — 阿里云千问 TTS
- `@/utils/json` — AI JSON 响应解析
