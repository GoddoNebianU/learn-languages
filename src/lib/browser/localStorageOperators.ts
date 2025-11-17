import {
  TranslationHistoryArraySchema,
  TranslationHistorySchema,
} from "@/lib/interfaces";
import z from "zod";
import { shallowEqual } from "../utils";

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


const MAX_HISTORY_LENGTH = 50;
export const tlso = getLocalStorageOperator<
  typeof TranslationHistoryArraySchema
>("translator", TranslationHistoryArraySchema);

export const tlsoPush = (item: z.infer<typeof TranslationHistorySchema>) => {
  const oldHistory = tlso.get();
  if (oldHistory.some((v) => shallowEqual(v, item))) return oldHistory;

  const newHistory = [...oldHistory, item].slice(-MAX_HISTORY_LENGTH);
  tlso.set(newHistory);

  return newHistory;
};
