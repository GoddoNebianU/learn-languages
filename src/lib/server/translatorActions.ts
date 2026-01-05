"use server";

import { getLLMAnswer } from "./ai";

export const genIPA = async (text: string) => {
  return (
    "[" +
    (
      await getLLMAnswer(
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
  return await getLLMAnswer(
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

export const genTranslation = async (text: string, targetLanguage: string) => {
  return await getLLMAnswer(
    `
<text>${text}</text>

请将以上文本翻译到 <target_language>${targetLanguage}</target_language>
然后直接发给我
不要附带任何说明
不要擅自增减符号
`.trim(),
  );
};
