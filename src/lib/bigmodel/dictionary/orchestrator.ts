import { ServiceOutputLookUp } from "@/modules/dictionary/dictionary-service-dto";
import { analyzeInput } from "./stage1-inputAnalysis";
import { determineSemanticMapping } from "./stage2-semanticMapping";
import { generateStandardForm } from "./stage3-standardForm";
import { generateEntries } from "./stage4-entriesGeneration";
import { LookUpError } from "@/lib/errors";

export async function executeDictionaryLookup(
    text: string,
    queryLang: string,
    definitionLang: string
): Promise<ServiceOutputLookUp> {
    try {
        // ========== 阶段 1：输入分析 ==========
        console.log("[阶段1] 开始输入分析...");
        const analysis = await analyzeInput(text);

        // 代码层面验证：输入是否有效
        if (!analysis.isValid) {
            console.log("[阶段1] 输入无效:", analysis.reason);
            throw analysis.reason || "无效输入";
        }

        if (analysis.isEmpty) {
            console.log("[阶段1] 输入为空");
            throw "输入为空";
        }

        console.log("[阶段1] 输入分析完成:", analysis);

        // ========== 阶段 2：语义映射 ==========
        console.log("[阶段2] 开始语义映射...");
        const semanticMapping = await determineSemanticMapping(
            text,
            queryLang,
            analysis.inputLanguage || text
        );

        console.log("[阶段2] 语义映射完成:", semanticMapping);

        // ========== 阶段 3：生成标准形式 ==========
        console.log("[阶段3] 开始生成标准形式...");

        // 如果进行了语义映射，标准形式要基于映射后的结果
        // 同时传递原始输入作为语义参考
        const shouldUseMapping = semanticMapping.shouldMap && semanticMapping.mappedQuery;
        const inputForStandardForm = shouldUseMapping ? semanticMapping.mappedQuery! : text;

        const standardFormResult = await generateStandardForm(
            inputForStandardForm,
            queryLang,
            shouldUseMapping ? text : undefined  // 如果进行了映射，传递原始输入作为语义参考
        );

        // 代码层面验证：标准形式不能为空
        if (!standardFormResult.standardForm) {
            console.error("[阶段3] 标准形式为空");
            throw "无法生成标准形式";
        }

        console.log("[阶段3] 标准形式生成完成:", standardFormResult);

        // ========== 阶段 4：生成词条 ==========
        console.log("[阶段4] 开始生成词条...");
        const entriesResult = await generateEntries(
            standardFormResult.standardForm,
            queryLang,
            definitionLang,
            analysis.inputType === "unknown"
                ? (standardFormResult.standardForm.includes(" ") ? "phrase" : "word")
                : analysis.inputType
        );

        console.log("[阶段4] 词条生成完成:", entriesResult);

        // ========== 组装最终结果 ==========
        const finalResult: ServiceOutputLookUp = {
            standardForm: standardFormResult.standardForm,
            entries: entriesResult.entries,
        };

        console.log("[完成] 词典查询成功");
        return finalResult;

    } catch (error) {
        console.error("[错误] 词典查询失败:", error);

        const errorMessage = error instanceof Error ? error.message : "未知错误";
        throw new LookUpError(errorMessage);
    }
}
