import type { ReadingResult } from "@/shared/reading-type";

export type ServiceInputReadText = {
  text: string;
  targetLanguage: string;
  sourceLanguage?: string;
};

export type ServiceOutputReadText = ReadingResult;
