export interface ReadingToken {
  text: string;
  index: number;
}

export interface ReadingAlignment {
  sourceIndices: number[];
  targetIndices: number[];
}

export interface ReadingSentencePair {
  sourceSentence: string;
  translatedSentence: string;
  sourceTokens: ReadingToken[];
  targetTokens: ReadingToken[];
  alignments: ReadingAlignment[];
}

export interface ReadingResult {
  sourceLanguage: string;
  targetLanguage: string;
  sentences: ReadingSentencePair[];
}
