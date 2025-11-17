import { EdgeTTS, ProsodyOptions } from "edge-tts-universal/browser";
import { env } from "process";
import z from "zod";
import { NextResponse } from "next/server";

export function inspect(word: string) {
  const goto = (url: string) => {
    window.open(url, "_blank");
  };
  return () => {
    word = word.toLowerCase();
    goto(`https://www.youdao.com/result?word=${word}&lang=en`);
  };
}

export function urlGoto(url: string) {
  window.open(url, "_blank");
}
const API_KEY = env.ZHIPU_API_KEY;
export async function callZhipuAPI(
  messages: { role: string; content: string }[],
  model = "glm-4.6",
) {
  const url = "https://open.bigmodel.cn/api/paas/v4/chat/completions";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      temperature: 0.2,
      thinking: {
        type: "disabled",
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`API 调用失败: ${response.status}`);
  }

  return await response.json();
}

export async function getTTSAudioUrl(
  text: string,
  short_name: string,
  options: ProsodyOptions | undefined = undefined,
) {
  const tts = new EdgeTTS(text, short_name, options);
  try {
    const result = await tts.synthesize();
    return URL.createObjectURL(result.audio);
  } catch (e) {
    throw e;
  }
}

export const getLocalStorageOperator = <T extends z.ZodTypeAny>(
  key: string,
  schema: T,
) => {
  return {
    get: (): z.infer<T> => {
      try {
        const item = globalThis.localStorage.getItem(key);

        if (!item) return [];

        const rawData = JSON.parse(item) as z.infer<T>;
        const result = schema.safeParse(rawData);

        if (result.success) {
          return result.data;
        } else {
          console.error(
            "Invalid data structure in localStorage:",
            result.error,
          );
          return [];
        }
      } catch (e) {
        console.error(`Failed to parse ${key} data:`, e);
        return [];
      }
    },
    set: (data: z.infer<T>) => {
      if (!globalThis.localStorage) return;
      globalThis.localStorage.setItem(key, JSON.stringify(data));
      return data;
    },
  };
};

export function handleAPIError(error: unknown, message: string) {
  console.error(message, error);
  return NextResponse.json(
    { error: "服务器内部错误", message },
    { status: 500 },
  );
}


export const letsFetch = (
  url: string,
  onSuccess: (message: string) => void,
  onError: (message: string) => void,
  onFinally: () => void,
) => {
  return fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        onSuccess(data.message);
      } else if (data.status === "error") {
        onError(data.message);
      } else {
        onError("Unknown error");
      }
    })
    .finally(onFinally);
};

export function isNonNegativeInteger(str: string): boolean {
  return /^\d+$/.test(str);
}

export function shallowEqual<T extends object>(obj1: T, obj2: T): boolean {
  const keys1 = Object.keys(obj1) as Array<keyof T>;
  const keys2 = Object.keys(obj2) as Array<keyof T>;
  
  // 首先检查键的数量是否相同
  if (keys1.length !== keys2.length) {
    return false;
  }
  
  // 然后逐个比较键值对
  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) {
      return false;
    }
  }
  
  return true;
}
