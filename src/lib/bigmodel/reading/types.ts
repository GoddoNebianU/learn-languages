export interface Token {
  text: string;
  index: number;
}

export interface Alignment {
  sourceIndices: number[];
  targetIndices: number[];
}

export interface SentencePair {
  sourceSentence: string;
  translatedSentence: string;
  sourceTokens: Token[];
  targetTokens: Token[];
  alignments: Alignment[];
}

export interface ReadingResult {
  sourceLanguage: string;
  targetLanguage: string;
  sentences: SentencePair[];
}

export interface Stage1SentencePair {
  sourceSentence: string;
  translatedSentence: string;
}

export interface Stage1Response {
  sentencePairs: Stage1SentencePair[];
}

export interface Stage2SentenceResult {
  sourceTokens: string[];
  targetTokens: string[];
  alignments: Array<{
    sourceIndices: number[];
    targetIndices: number[];
  }>;
}

export interface Stage2Response {
  sentences: Stage2SentenceResult[];
}
