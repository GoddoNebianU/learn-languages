"use server";

import { getLLMAnswer } from "./ai";

export const genIPA = async (text: string) => {
  return (
    "[" +
    (
      await getLLMAnswer(
        `${text}\n请生成以上文本的严式国际音标，然后直接发给我，不要附带任何说明，不要擅自增减符号。`,
      )
    )
      .replaceAll("[", "")
      .replaceAll("]", "") +
    "]"
  );
};

export const genLocale = async (text: string) => {
  return await getLLMAnswer(
    `${text}\n推断以上文本的地区（locale），然后直接发给我，形如如zh-CN，不要附带任何说明，不要擅自增减符号。`,
  );
};

export const genTranslation = async (text: string, targetLanguage: string) => {
  return await getLLMAnswer(
    `${text}\n请将以上文本翻译到${targetLanguage}，然后直接发给我，不要附带任何说明，不要擅自增减符号。`,
  );
};
