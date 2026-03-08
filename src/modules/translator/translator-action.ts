"use server";

import {
    ActionInputTranslateText,
    ActionOutputTranslateText,
    validateActionInputTranslateText,
} from "./translator-action-dto";
import { ValidateError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";
import { serviceTranslateText } from "./translator-service";
import { getAnswer } from "@/lib/bigmodel/zhipu";

const log = createLogger("translator-action");

export const actionTranslateText = async (
    dto: ActionInputTranslateText
): Promise<ActionOutputTranslateText> => {
    try {
        return {
            message: "success",
            success: true,
            data: await serviceTranslateText(validateActionInputTranslateText(dto)),
        };
    } catch (e) {
        if (e instanceof ValidateError) {
            return {
                success: false,
                message: e.message,
            };
        }
        log.error("Translation action failed", { error: e });
        return {
            success: false,
            message: "Unknown error occurred.",
        };
    }
};

/**
 * @deprecated 保留此函数以支持旧代码（text-speaker 功能）
 */
export const genIPA = async (text: string) => {
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

/**
 * @deprecated 保留此函数以支持旧代码（text-speaker 功能）
 */
export const genLanguage = async (text: string) => {
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
