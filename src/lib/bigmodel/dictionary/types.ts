/**
 * 词典查询的类型定义
 */

export interface DictionaryContext {
    queryLang: string;
    definitionLang: string;
}

// 阶段1：输入分析结果
export interface InputAnalysisResult {
    isValid: boolean;
    isEmpty: boolean;
    isNaturalLanguage: boolean;
    inputLanguage?: string;
    inputType: "word" | "phrase" | "unknown";
    reason: string;
}

// 阶段2：语义映射结果
export interface SemanticMappingResult {
    shouldMap: boolean;
    canMap?: boolean;
    coreSemantic?: string;
    mappedQuery?: string;
    reason: string;
}

// 阶段3：标准形式结果
export interface StandardFormResult {
    standardForm: string;
    confidence: "high" | "medium" | "low";
    reason: string;
}

// 阶段4：词条生成结果
export interface EntriesGenerationResult {
    entries: Array<{
        ipa?: string;
        definition: string;
        partOfSpeech?: string;
        example: string; // example 必需
    }>;
}
