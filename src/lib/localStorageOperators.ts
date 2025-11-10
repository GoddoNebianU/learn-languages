import { TranslationHistoryArraySchema, TranslationHistorySchema } from "@/interfaces";
import { getLocalStorageOperator } from "@/utils";
import z from "zod";

const MAX_HISTORY_LENGTH = 50;

export const tlso = getLocalStorageOperator<typeof TranslationHistoryArraySchema>(
  "translator",
  TranslationHistoryArraySchema,
);
export const tlsoPush = (item: z.infer<typeof TranslationHistorySchema>) => {
  tlso.set(
    [...tlso.get(), item as z.infer<typeof TranslationHistorySchema>].slice(
      -MAX_HISTORY_LENGTH,
    ),
  );
};