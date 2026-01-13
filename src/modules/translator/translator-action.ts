"use server";

import { getAnswer } from "@/lib/bigmodel/zhipu";
import { selectLatestTranslation, createTranslationHistory } from "./translator-service";
import { TranslateTextInput, TranslateTextOutput, TranslationLLMResponse } from "./translator-dto";

/**
 * @deprecated 请使用 translateText 函数代替
 * 保留此函数以支持旧代码（text-speaker 功能）
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
 * @deprecated 请使用 translateText 函数代替
 * 保留此函数以支持旧代码（text-speaker 功能）
 */
export const genLocale = async (text: string) => {
  return await getAnswer(
    `
<text>${text}</text>

推断以上文本的地区（locale）
然后直接发给我
形如如zh-CN
不要附带任何说明
不要擅自增减符号
`.trim(),
  );
};

/**
 * @deprecated 请使用 translateText 函数代替
 * 保留此函数以支持旧代码（text-speaker 功能）
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

/**
 * @deprecated 请使用 translateText 函数代替
 * 保留此函数以支持旧代码（text-speaker 功能）
 */
export const genTranslation = async (text: string, targetLanguage: string) => {

  return await getAnswer(
    `
<text>${text}</text>

请将以上文本翻译到 <target_language>${targetLanguage}</target_language>
然后直接发给我
不要附带任何说明
不要擅自增减符号
`.trim(),
  );
};

/**
 * 统一的翻译函数
 * 一次调用生成所有信息，支持缓存查询
 */
export async function translateText(options: TranslateTextInput): Promise<TranslateTextOutput> {
  const {
    sourceText,
    targetLanguage,
    forceRetranslate = false,
    needIpa = true,
    userId,
  } = options;

  // 1. 检查缓存（如果未强制重新翻译）并获取翻译数据
  let translatedData: TranslationLLMResponse | null = null;
  let fromCache = false;

  if (!forceRetranslate) {
    const cached = await selectLatestTranslation({
      sourceText,
      targetLanguage,
    });

    if (cached && cached.translatedText && cached.sourceLanguage) {
      // 如果不需要 IPA，或缓存已有 IPA，使用缓存
      if (!needIpa || (cached.sourceIpa && cached.targetIpa)) {
        console.log("✅ 翻译缓存命中");
        translatedData = {
          translatedText: cached.translatedText,
          sourceLanguage: cached.sourceLanguage,
          targetLanguage: cached.targetLanguage,
          sourceIpa: cached.sourceIpa || undefined,
          targetIpa: cached.targetIpa || undefined,
        };
        fromCache = true;
      }
    }
  }

  // 2. 如果缓存未命中，调用 LLM 生成翻译
  if (!fromCache) {
    translatedData = await callTranslationLLM({
      sourceText,
      targetLanguage,
      needIpa,
    });
  }

  // 3. 保存到数据库（不管缓存是否命中都保存）
  if (translatedData) {
    try {
      await createTranslationHistory({
        userId,
        sourceText,
        sourceLanguage: translatedData.sourceLanguage,
        targetLanguage: translatedData.targetLanguage,
        translatedText: translatedData.translatedText,
        sourceIpa: needIpa ? translatedData.sourceIpa : undefined,
        targetIpa: needIpa ? translatedData.targetIpa : undefined,
      });
    } catch (error) {
      console.error("保存翻译历史失败:", error);
    }
  }
  return {
    sourceText,
    translatedText: translatedData!.translatedText,
    sourceLanguage: translatedData!.sourceLanguage,
    targetLanguage: translatedData!.targetLanguage,
    sourceIpa: needIpa ? (translatedData!.sourceIpa || "") : "",
    targetIpa: needIpa ? (translatedData!.targetIpa || "") : "",
  };
}

/**
 * 调用 LLM 生成翻译和相关数据
 */
async function callTranslationLLM(params: {
  sourceText: string;
  targetLanguage: string;
  needIpa: boolean;
}): Promise<TranslationLLMResponse> {
  const { sourceText, targetLanguage, needIpa } = params;

  console.log("🤖 调用 LLM 翻译");

  let systemPrompt = "你是一个专业的翻译助手。请根据用户的要求翻译文本，并返回 JSON 格式的结果。\n\n返回的 JSON 必须严格符合以下格式：\n{\n  \"translatedText\": \"翻译后的文本\",\n  \"sourceLanguage\": \"源语言的标准英文名称（如 Chinese, English, Japanese）\",\n  \"targetLanguage\": \"目标语言的标准英文名称\"";

  if (needIpa) {
    systemPrompt += ",\n  \"sourceIpa\": \"源文本的严式国际音标（用方括号包裹，如 [tɕɪn˥˩]\",\n  \"targetIpa\": \"译文的严式国际音标（用方括号包裹）\"";
  }

  systemPrompt += "}\n\n规则：\n1. 只返回 JSON，不要包含任何其他文字说明\n2. 语言名称必须是标准英文名称，首字母大写\n";

  if (needIpa) {
    systemPrompt += "3. 国际音标必须用方括号 [] 包裹，使用严式音标\n";
  } else {
    systemPrompt += "3. 本次请求不需要生成国际音标\n";
  }

  systemPrompt += needIpa ? "4. 确保翻译准确、自然" : "4. 确保翻译准确、自然";

  const userPrompt = `请将以下文本翻译成 ${targetLanguage}：\n\n<text>${sourceText}</text>\n\n返回 JSON 格式的翻译结果。`;

  const response = await getAnswer([
    {
      role: "system",
      content: systemPrompt,
    },
    {
      role: "user",
      content: userPrompt,
    },
  ]);

  // 解析 LLM 返回的 JSON
  try {
    // 清理响应：移除 markdown 代码块标记和多余空白
    let cleanedResponse = response
      .replace(/```json\s*\n/g, "")  // 移除 ```json 开头
      .replace(/```\s*\n/g, "")     // 移除 ``` 结尾
      .replace(/```\s*$/g, "")      // 移除末尾的 ```
      .replace(/```json\s*$/g, "")  // 移除末尾的 ```json
      .trim();

    const parsed = JSON.parse(cleanedResponse) as TranslationLLMResponse;

    // 验证必需字段
    if (!parsed.translatedText || !parsed.sourceLanguage || !parsed.targetLanguage) {
      throw new Error("LLM 返回的数据缺少必需字段");
    }

    console.log("LLM 翻译成功");
    return parsed;
  } catch (error) {
    console.error("LLM 翻译失败:", error);
    console.error("原始响应:", response);
    throw new Error("翻译失败：无法解析 LLM 响应");
  }
}
