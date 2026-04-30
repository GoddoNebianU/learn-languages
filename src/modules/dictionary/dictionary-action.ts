"use server";

import { executeDictionaryLookup } from "@/lib/bigmodel/dictionary/orchestrator";
import { createLogger } from "@/lib/logger";
import { LookUpError } from "@/lib/errors";
import {
  ActionInputLookUpDictionary,
  ActionOutputLookUpDictionary,
  validateActionInputLookUpDictionary,
} from "./dictionary-action-dto";
import { serviceGetCardByWord } from "@/modules/card/card-service";

const log = createLogger("dictionary-action");

export async function actionLookUpDictionary(
  input: unknown
): Promise<ActionOutputLookUpDictionary> {
  try {
    const validated = validateActionInputLookUpDictionary(input);

    const result = await executeDictionaryLookup(
      validated.text,
      validated.queryLang,
      validated.definitionLang,
      validated.deckId
        ? {
            shouldContinue: async (standardForm: string) => {
              const card = await serviceGetCardByWord({
                deckId: validated.deckId!,
                word: standardForm,
              });
              if (card) {
                const cachedEntries = card.meanings.map((m) => ({
                  ipa: card.ipa ?? undefined,
                  definition: m.definition,
                  partOfSpeech: m.partOfSpeech ?? undefined,
                  example: m.example ?? "",
                }));
                return { continue: false, cachedEntries };
              }
              return { continue: true };
            },
          }
        : undefined
    );

    return {
      success: true,
      message: "Lookup successful",
      data: result,
    };
  } catch (e) {
    if (e instanceof LookUpError) {
      return { success: false, message: e.message };
    }
    log.error("Dictionary lookup failed", { error: e instanceof Error ? e.message : String(e) });
    return { success: false, message: "Lookup failed" };
  }
}
