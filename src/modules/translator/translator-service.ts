import { executeTranslation } from "@/lib/bigmodel/translator/orchestrator";
import { getAnswer } from "@/lib/bigmodel/llm";
import { repoCreateTranslationHistory, repoSelectLatestTranslation } from "./translator-repository";
import {
    ServiceInputTranslateText,
    ServiceOutputTranslateText,
    ServiceInputGenIPA,
    ServiceOutputGenIPA,
    ServiceInputGenLanguage,
    ServiceOutputGenLanguage,
} from "./translator-service-dto";
import { createLogger } from "@/lib/logger";

const log = createLogger("translator-service");

export const serviceTranslateText = async (
    dto: ServiceInputTranslateText
): Promise<ServiceOutputTranslateText> => {
    const { sourceText, targetLanguage, forceRetranslate, needIpa, userId, sourceLanguage } = dto;

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
            needIpa,
            sourceLanguage
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
            log.error("Failed to save translation data", { error });
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
            log.error("Failed to save translation data", { error });
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

export const serviceGenIPA = async (
    dto: ServiceInputGenIPA
): Promise<ServiceOutputGenIPA> => {
    const { text } = dto;
    return (
        "[" +
        (
            await getAnswer(
                `
<text>${text}</text>

请生成以上文本的严式国际音标
然后直接发给我
不要附带任何说明
不要擅自增减符号
不许用"/"或者"[]"包裹
`.trim(),
            )
        )
            .replaceAll("[", "")
            .replaceAll("]", "") +
        "]"
    );
};

export const serviceGenLanguage = async (
    dto: ServiceInputGenLanguage
): Promise<ServiceOutputGenLanguage> => {
    const { text } = dto;
    const language = await getAnswer([
        {
            role: "system",
            content: `
你是一个语言检测工具。请识别文本的语言并返回语言名称。

返回语言的标准英文名称，例如：
- 中文: Chinese
- 英语: English
- 日语: Japanese
- 韩语: Korean
- 法语: French
- 德语: German
- 意大利语: Italian
- 葡萄牙语: Portuguese
- 西班牙语: Spanish
- 俄语: Russian
- 阿拉伯语: Arabic
- 印地语: Hindi
- 泰语: Thai
- 越南语: Vietnamese
- 等等...

如果无法识别语言，返回 "Unknown"

规则：
1. 只返回语言的标准英文名称
2. 首字母大写，其余小写
3. 不要附带任何说明
4. 不要擅自增减符号
      `.trim()
        },
        {
            role: "user",
            content: `<text>${text}</text>`
        }
    ]);
    return language.trim();
};
