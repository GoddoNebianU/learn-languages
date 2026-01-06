/**
 * 词典查询模块 - 多阶段 LLM 调用架构
 *
 * 将词典查询拆分为 4 个独立的 LLM 调用阶段，每个阶段都有代码层面的数据验证
 * 只要有一环失败，直接返回错误
 */

// 导出主编排器
export { executeDictionaryLookup } from "./orchestrator";

// 导出各阶段的独立函数（可选，用于调试或单独使用）
export { analyzeInput } from "./stage1-inputAnalysis";
export { determineSemanticMapping } from "./stage2-semanticMapping";
export { generateStandardForm } from "./stage3-standardForm";
export { generateEntries } from "./stage4-entriesGeneration";

// 导出类型定义
export * from "./types";
