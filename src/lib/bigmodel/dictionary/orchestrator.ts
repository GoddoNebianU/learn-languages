import { ServiceOutputLookUp } from "@/modules/dictionary/dictionary-service-dto";
import { analyzeInput } from "./stage1-inputAnalysis";
import { determineSemanticMapping } from "./stage2-semanticMapping";
import { generateStandardForm } from "./stage3-standardForm";
import { generateEntries } from "./stage4-entriesGeneration";
import { LookUpError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";

const log = createLogger("dictionary-orchestrator");

export async function executeDictionaryLookup(
    text: string,
    queryLang: string,
    definitionLang: string
): Promise<ServiceOutputLookUp> {
    try {
        log.debug("[Stage 1] Starting input analysis");
        const analysis = await analyzeInput(text);

        if (!analysis.isValid) {
            log.debug("[Stage 1] Invalid input", { reason: analysis.reason });
            throw new LookUpError(analysis.reason || "无效输入");
        }

        if (analysis.isEmpty) {
            log.debug("[Stage 1] Empty input");
            throw new LookUpError("输入为空");
        }

        log.debug("[Stage 1] Analysis complete", { analysis });

        log.debug("[Stage 2] Starting semantic mapping");
        const semanticMapping = await determineSemanticMapping(
            text,
            queryLang,
            analysis.inputLanguage ?? text
        );

        log.debug("[Stage 2] Semantic mapping complete", { semanticMapping });

        log.debug("[Stage 3] Generating standard form");

        // 如果进行了语义映射，标准形式要基于映射后的结果
        // 同时传递原始输入作为语义参考
        const shouldUseMapping = semanticMapping.shouldMap && semanticMapping.mappedQuery;
        const inputForStandardForm = shouldUseMapping ? semanticMapping.mappedQuery! : text;

        const standardFormResult = await generateStandardForm(
            inputForStandardForm,
            queryLang,
            shouldUseMapping ? text : undefined  // 如果进行了映射，传递原始输入作为语义参考
        );

        if (!standardFormResult.standardForm) {
            log.error("[Stage 3] Standard form is empty");
            throw "无法生成标准形式";
        }

        log.debug("[Stage 3] Standard form complete", { standardFormResult });

        log.debug("[Stage 4] Generating entries");
        const entriesResult = await generateEntries(
            standardFormResult.standardForm,
            queryLang,
            definitionLang,
            analysis.inputType === "unknown"
                ? (standardFormResult.standardForm.includes(" ") ? "phrase" : "word")
                : analysis.inputType
        );

        log.debug("[Stage 4] Entries complete", { entriesResult });

        const finalResult: ServiceOutputLookUp = {
            standardForm: standardFormResult.standardForm,
            entries: entriesResult.entries,
        };

        log.info("Dictionary lookup completed successfully");
        return finalResult;

    } catch (error) {
        log.error("Dictionary lookup failed", { error });

        const errorMessage = error instanceof Error ? error.message : "未知错误";
        throw new LookUpError(errorMessage);
    }
}
