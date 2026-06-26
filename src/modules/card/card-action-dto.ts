import z from "zod";
import { generateValidator } from "@/utils/validate";
import type { RepoOutputCard, CardMeaning, CardExample, CardType } from "./card-repository-dto";

export type ActionOutputCard = RepoOutputCard;
export type { CardMeaning, CardExample, CardType };

const CardExampleSchema = z.object({
  example: z.string(),
  translation: z.string().optional().nullable(),
});

const CardMeaningSchema = z.object({
  partOfSpeech: z.string().nullable(),
  definition: z.string(),
  examples: z.array(CardExampleSchema),
});

export const schemaActionInputCreateCard = z.object({
  deckId: z.number().int().positive(),
  word: z.string().min(1),
  ipa: z.string().optional().nullable(),
  queryLang: z.string().min(1),
  cardType: z.enum(["WORD", "PHRASE", "SENTENCE"]),
  meanings: z.array(CardMeaningSchema).min(1),
});
export type ActionInputCreateCard = z.infer<typeof schemaActionInputCreateCard>;
export const validateActionInputCreateCard = generateValidator(schemaActionInputCreateCard);

export const schemaActionInputUpdateCard = z.object({
  cardId: z.number().int().positive(),
  word: z.string().min(1).optional(),
  ipa: z.string().optional().nullable(),
  meanings: z.array(CardMeaningSchema).min(1).optional(),
  hidden: z.boolean().optional(),
});
export type ActionInputUpdateCard = z.infer<typeof schemaActionInputUpdateCard>;
export const validateActionInputUpdateCard = generateValidator(schemaActionInputUpdateCard);

export const schemaActionInputDeleteCard = z.object({
  cardId: z.number().int().positive(),
});
export type ActionInputDeleteCard = z.infer<typeof schemaActionInputDeleteCard>;
export const validateActionInputDeleteCard = generateValidator(schemaActionInputDeleteCard);

export const schemaActionInputGetCardsByDeckId = z.object({
  deckId: z.number().int().positive(),
  limit: z.number().int().min(1).optional(),
  offset: z.number().int().min(0).optional(),
  includeHidden: z.boolean().optional(),
});
export type ActionInputGetCardsByDeckId = z.infer<typeof schemaActionInputGetCardsByDeckId>;
export const validateActionInputGetCardsByDeckId = generateValidator(
  schemaActionInputGetCardsByDeckId
);

export const schemaActionInputGetRandomCard = z.object({
  deckId: z.number().int().positive(),
  excludeIds: z.array(z.number().int().positive()).optional(),
});
export type ActionInputGetRandomCard = z.infer<typeof schemaActionInputGetRandomCard>;
export const validateActionInputGetRandomCard = generateValidator(schemaActionInputGetRandomCard);

export const schemaActionInputCheckCardExistsByWord = z.object({
  deckId: z.number().int().positive(),
  word: z.string().min(1),
});
export type ActionInputCheckCardExistsByWord = z.infer<typeof schemaActionInputCheckCardExistsByWord>;
export const validateActionInputCheckCardExistsByWord = generateValidator(
  schemaActionInputCheckCardExistsByWord
);

export type ActionOutputGetCardByWord = {
  success: boolean;
  message: string;
  data?: ActionOutputCard;
};

export const schemaActionInputGetCardCount = z.object({
  deckId: z.number().int().positive(),
  includeHidden: z.boolean().optional(),
});
export type ActionInputGetCardCount = z.infer<typeof schemaActionInputGetCardCount>;
export const validateActionInputGetCardCount = generateValidator(schemaActionInputGetCardCount);

export type ActionOutputGetCardCount = {
  success: boolean;
  message: string;
  data?: { total: number };
};

export const schemaActionInputReorderCards = z.object({
  deckId: z.number().int().positive(),
  cardIds: z.array(z.number().int().positive()).min(1),
});
export type ActionInputReorderCards = z.infer<typeof schemaActionInputReorderCards>;
export const validateActionInputReorderCards = generateValidator(schemaActionInputReorderCards);
