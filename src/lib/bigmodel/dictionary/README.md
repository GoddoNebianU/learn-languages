# 词典查询模块化架构

本目录包含词典查询系统的**多阶段 LLM 调用**实现，将查询过程拆分为 4 个独立的 LLM 调用，每个阶段之间有代码层面的数据验证，只要有一环失败，直接返回错误。

## 目录结构

```
dictionary/
├── index.ts                    # 主导出文件
├── orchestrator.ts             # 主编排器，串联所有阶段
├── types.ts                    # 类型定义
├── stage1-inputAnalysis.ts     # 阶段1：输入解析与语言识别
├── stage2-semanticMapping.ts   # 阶段2：跨语言语义映射决策
├── stage3-standardForm.ts      # 阶段3：standardForm 生成与规范化
└── stage4-entriesGeneration.ts # 阶段4：释义与词条生成
```

## 工作流程

```
用户输入
    ↓
[阶段1] 输入分析 → 代码验证 → 失败则返回错误
    ↓
[阶段2] 语义映射 → 代码验证 → 失败则保守处理（不映射）
    ↓
[阶段3] 标准形式 → 代码验证 → 失败则返回错误
    ↓
[阶段4] 词条生成 → 代码验证 → 失败则返回错误
    ↓
最终结果
```

## 各阶段详细说明

### 阶段 1：输入分析

**文件**: `stage1-inputAnalysis.ts`

**目的**:
- 判断输入是否有效
- 判断是「单词」还是「短语」
- 识别输入语言

**返回**: `InputAnalysisResult`

**代码验证**:
- `isValid` 必须是 boolean
- 输入为空或无效时立即返回错误

### 阶段 2：语义映射

**文件**: `stage2-semanticMapping.ts`

**目的**:
- 决定是否启用"语义级查询"
- **严格条件**：只有输入符合"明确、基础、可词典化的语义概念"且语言不一致时才映射
- 不符合条件则**直接失败**（快速失败）

**返回**: `SemanticMappingResult`

**代码验证**:
- `shouldMap` 必须是 boolean
- 如果 `shouldMap=true`，必须有 `mappedQuery`
- 如果不应该映射，**抛出异常**（不符合条件直接失败）
- **失败则直接返回错误响应**，不继续后续阶段

**映射条件**（必须同时满足）：
a) 输入语言 ≠ 查询语言
b) 输入是明确、基础、可词典化的语义概念（如常见动词、名词、形容词）

**不符合条件的例子**：
- 复杂句子："我喜欢吃苹果"
- 专业术语
- 无法确定语义的词汇

### 阶段 3：标准形式生成

**文件**: `stage3-standardForm.ts`

**目的**:
- 确定最终词条的"标准形"（整个系统的锚点）
- 修正拼写错误
- 还原为词典形式（动词原形、辞书形等）
- **如果进行了语义映射**：基于映射结果生成标准形式，同时参考原始输入的语义上下文

**参数**:
- `inputText`: 用于生成标准形式的文本（可能是映射后的结果）
- `queryLang`: 查询语言
- `originalInput`: （可选）原始用户输入，用于语义参考

**返回**: `StandardFormResult`

**代码验证**:
- `standardForm` 不能为空
- `confidence` 必须是 "high" | "medium" | "low"
- 失败时使用原输入作为标准形式

**特殊逻辑**:
- 当进行了语义映射时（即提供了 `originalInput`），阶段 3 会：
  1. 基于 `inputText`（映射结果）生成标准形式
  2. 参考 `originalInput` 的语义上下文，确保标准形式符合用户的真实查询意图
  3. 例如：原始输入 "吃"（中文）→ 映射为 "to eat"（英语）→ 标准形式 "eat"

### 阶段 4：词条生成

**文件**: `stage4-entriesGeneration.ts`

**目的**:
- 生成真正的词典内容
- 根据类型生成单词或短语条目

**返回**: `EntriesGenerationResult`

**代码验证**:
- `entries` 必须是非空数组
- 每个条目必须有 `definition` 和 `example`
- 单词条目必须有 `partOfSpeech`
- **失败则抛出异常**（核心阶段）

## 使用方式

### 基本使用

```typescript
import { lookUp } from "@/lib/server/bigmodel/dictionaryActions";

const result = await lookUp({
    text: "hello",
    queryLang: "English",
    definitionLang: "中文"
});
```

### 高级使用（直接调用编排器）

```typescript
import { executeDictionaryLookup } from "@/lib/server/bigmodel/dictionary";

const result = await executeDictionaryLookup(
    "hello",
    "English",
    "中文"
);
```

### 单独测试某个阶段

```typescript
import { analyzeInput } from "@/lib/server/bigmodel/dictionary";

const analysis = await analyzeInput("hello");
console.log(analysis);
```

## 设计优势

### 1. 代码层面的数据验证
每个阶段完成后都有严格的类型检查和数据验证，确保数据质量。

### 2. 快速失败
只要有一个阶段失败，立即返回错误，不浪费后续的 LLM 调用。

### 3. 可观测性
每个阶段都有 console.log 输出，方便调试和追踪问题。

### 4. 模块化
每个阶段独立文件，可以单独测试、修改或替换。

### 5. 容错性
非核心阶段（阶段2、3）失败时有降级策略，不会导致整个查询失败。

## 日志示例

```
[阶段1] 开始输入分析...
[阶段1] 输入分析完成: { isValid: true, inputType: 'word', inputLanguage: 'English' }
[阶段2] 开始语义映射...
[阶段2] 语义映射完成: { shouldMap: false }
[阶段3] 开始生成标准形式...
[阶段3] 标准形式生成完成: { standardForm: 'hello', confidence: 'high' }
[阶段4] 开始生成词条...
[阶段4] 词条生成完成: { entries: [...] }
[完成] 词典查询成功
```

## 扩展建议

### 添加缓存
对阶段1、3的结果进行缓存，避免重复调用 LLM。

### 添加指标
记录每个阶段的耗时和成功率，用于性能优化。

### 并行化
某些阶段可以并行执行（如果有依赖关系允许的话）。

### A/B 测试
为某个阶段创建不同版本的实现，进行效果对比。

## 注意事项

- 每个阶段都是独立的 LLM 调用，会增加总耗时
- 需要控制 token 使用量，避免成本过高
- 错误处理要完善，避免某个阶段卡住整个流程
- 日志记录要清晰，方便问题排查
