# 词典查询架构

2 次 LLM 调用的词典查询系统。

## 目录结构

```
dictionary/
├── orchestrator.ts             # 编排器
├── stage1-preprocess.ts        # 阶段1：预处理（输入分析+语义映射+标准形式）
├── stage4-entriesGeneration.ts # 阶段2：词条生成
└── types.ts                    # 类型定义
```

## 工作流程

```
用户输入
    ↓
[阶段1] 预处理（1次LLM）→ isValid, standardForm, inputType
    ↓
[阶段2] 词条生成（1次LLM）→ entries
    ↓
最终结果
```

## 性能

- 原 4 次 LLM 调用 → 现 2 次
- 预期耗时：8-13s（原 33s）

## 使用

```typescript
import { executeDictionaryLookup } from "@/lib/bigmodel/dictionary/orchestrator";

const result = await executeDictionaryLookup("hello", "English", "中文");
```
