import { ServiceOutputLookUp } from "@/modules/dictionary/dictionary-service-dto";
import { preprocessInput } from "./stage1-preprocess";
import { generateEntries } from "./stage4-entriesGeneration";
import { LookUpError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";

const log = createLogger("dictionary-orchestrator");

export type CachedEntry = {
  ipa?: string;
  definition: string;
  partOfSpeech?: string;
  example: string;
};

export type ShouldContinueResult =
  | { continue: true }
  | { continue: false; cachedEntries: CachedEntry[] };

export async function executeDictionaryLookup(
  text: string,
  queryLang: string,
  definitionLang: string,
  options?: {
    shouldContinue?: (standardForm: string) => Promise<ShouldContinueResult>;
  }
): Promise<ServiceOutputLookUp> {
  try {
    log.debug("[Stage 1] Preprocessing input");
    const preprocessed = await preprocessInput(text, queryLang);

    if (!preprocessed.isValid) {
      log.debug("[Stage 1] Invalid input", { reason: preprocessed.reason });
      throw new LookUpError(preprocessed.reason || "无效输入");
    }

    log.debug("[Stage 1] Preprocess complete", { preprocessed });

    if (options?.shouldContinue) {
      const check = await options.shouldContinue(preprocessed.standardForm);
      if (!check.continue) {
        log.info("[Early exit] Card found in deck, using cached entries", {
          standardForm: preprocessed.standardForm,
          cachedCount: check.cachedEntries.length,
        });
        return {
          standardForm: preprocessed.standardForm,
          entries: check.cachedEntries,
          alreadyExists: true,
        };
      }
    }

    log.debug("[Stage 2] Generating entries");
    const entriesResult = await generateEntries(
      preprocessed.standardForm,
      queryLang,
      definitionLang,
      preprocessed.inputType
    );

    log.debug("[Stage 2] Entries complete", { entriesResult });

    const finalResult: ServiceOutputLookUp = {
      standardForm: preprocessed.standardForm,
      entries: entriesResult.entries,
    };

    log.info("Dictionary lookup completed successfully");
    return finalResult;
  } catch (error) {
    log.error("Dictionary lookup failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    const errorMessage = error instanceof Error ? error.message : "未知错误";
    throw new LookUpError(errorMessage);
  }
}
