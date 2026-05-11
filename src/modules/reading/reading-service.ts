import { executeReadingTranslation } from "@/lib/bigmodel/reading/orchestrator";
import type { ServiceInputReadText, ServiceOutputReadText } from "./reading-service-dto";
import { createLogger } from "@/lib/logger";

const log = createLogger("reading-service");

export const serviceReadText = async (dto: ServiceInputReadText): Promise<ServiceOutputReadText> => {
  const { text, targetLanguage, sourceLanguage } = dto;
  log.info("Reading text", { sourceTextLength: text.length, targetLanguage, sourceLanguage });

  const result = await executeReadingTranslation(text, targetLanguage, sourceLanguage);

  log.info("Reading translation completed");
  return result;
};
