import { executeTranslation } from "@/lib/bigmodel/translator/orchestrator";
import { repoCreateTranslationHistory, repoSelectLatestTranslation } from "./translator-repository";
import { ServiceInputTranslateText, ServiceOutputTranslateText } from "./translator-service-dto";

export const serviceTranslateText = async (
    dto: ServiceInputTranslateText
): Promise<ServiceOutputTranslateText> => {
    const { sourceText, targetLanguage, forceRetranslate, needIpa, userId } = dto;

    // Check for existing translation
    const lastTranslation = await repoSelectLatestTranslation({
        sourceText,
        targetLanguage,
    });

    if (forceRetranslate || !lastTranslation) {
        // Call AI for translation
        const response = await executeTranslation(
            sourceText,
            targetLanguage,
            needIpa
        );

        // Save translation history asynchronously (don't block response)
        repoCreateTranslationHistory({
            userId,
            sourceText,
            sourceLanguage: response.sourceLanguage,
            targetLanguage: response.targetLanguage,
            translatedText: response.translatedText,
            sourceIpa: needIpa ? response.sourceIpa : undefined,
            targetIpa: needIpa ? response.targetIpa : undefined,
        }).catch((error) => {
            console.error("Failed to save translation data:", error);
        });

        return {
            sourceText: response.sourceText,
            translatedText: response.translatedText,
            sourceLanguage: response.sourceLanguage,
            targetLanguage: response.targetLanguage,
            sourceIpa: response.sourceIpa || "",
            targetIpa: response.targetIpa || "",
        };
    } else {
        // Return cached translation
        // Still save a history record for analytics
        repoCreateTranslationHistory({
            userId,
            sourceText,
            sourceLanguage: lastTranslation.sourceLanguage,
            targetLanguage: lastTranslation.targetLanguage,
            translatedText: lastTranslation.translatedText,
            sourceIpa: lastTranslation.sourceIpa || undefined,
            targetIpa: lastTranslation.targetIpa || undefined,
        }).catch((error) => {
            console.error("Failed to save translation data:", error);
        });

        return {
            sourceText,
            translatedText: lastTranslation.translatedText,
            sourceLanguage: lastTranslation.sourceLanguage,
            targetLanguage: lastTranslation.targetLanguage,
            sourceIpa: lastTranslation.sourceIpa || "",
            targetIpa: lastTranslation.targetIpa || "",
        };
    }
};
