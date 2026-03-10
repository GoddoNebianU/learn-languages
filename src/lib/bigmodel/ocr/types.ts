/**
 * Input for OCR pipeline
 */
export interface OCRInput {
  /** Base64 encoded image (without data URL prefix) */
  imageBase64: string;
  /** Optional: hint about source language */
  sourceLanguage?: string;
  /** Optional: hint about target/translation language */
  targetLanguage?: string;
}

/**
 * Single word-definition pair extracted from image
 */
export interface VocabularyPair {
  /** The original word */
  word: string;
  /** The translation/definition */
  definition: string;
}

/**
 * Output from OCR pipeline
 */
export interface OCROutput {
  /** Extracted word-definition pairs */
  pairs: VocabularyPair[];
  /** Detected source language */
  detectedSourceLanguage?: string;
  /** Detected target/translation language */
  detectedTargetLanguage?: string;
}

/**
 * Internal structure for AI response parsing
 */
interface OCRRawResponse {
  pairs: Array<{ word: string; definition: string }>;
  detectedSourceLanguage?: string;
  detectedTargetLanguage?: string;
}

export type { OCRRawResponse };
