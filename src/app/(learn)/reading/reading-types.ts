import type { ReadingSentencePair } from "@/shared/reading-type";

export interface ParagraphData {
  sentences: ReadingSentencePair[];
  sourceLanguage: string;
  targetLanguage: string;
}

export interface HoverState {
  paragraphIdx: number;
  sentenceIdx: number;
  localIdx: number;
  side: "source" | "target";
}
