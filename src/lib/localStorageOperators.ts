import {
  TranslationHistoryArraySchema,
  TranslationHistorySchema,
} from "@/lib/interfaces";
import { getLocalStorageOperator, shallowEqual } from "@/lib/utils";
import z from "zod";

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
