"use server";

import { getAnswer } from "./zhipu";

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
