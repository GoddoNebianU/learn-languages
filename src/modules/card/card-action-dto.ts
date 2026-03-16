import z from "zod";
import { generateValidator } from "@/utils/validate";

export const schemaActionInputCreateCard = z.object({
  noteId: z.bigint(),
  deckId: z.number().int().positive(),
  ord: z.number().int().min(0).optional(),
});
export type ActionInputCreateCard = z.infer<typeof schemaActionInputCreateCard>;
export const validateActionInputCreateCard = generateValidator(schemaActionInputCreateCard);

export const schemaActionInputAnswerCard = z.object({
  cardId: z.bigint(),
  ease: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
  ]),
});
export type ActionInputAnswerCard = z.infer<typeof schemaActionInputAnswerCard>;
export const validateActionInputAnswerCard = generateValidator(schemaActionInputAnswerCard);

export const schemaActionInputGetCardsForReview = z.object({
  deckId: z.number().int().positive(),
  limit: z.number().int().min(1).max(100).optional(),
});
export type ActionInputGetCardsForReview = z.infer<typeof schemaActionInputGetCardsForReview>;
export const validateActionInputGetCardsForReview = generateValidator(schemaActionInputGetCardsForReview);

export const schemaActionInputGetNewCards = z.object({
  deckId: z.number().int().positive(),
  limit: z.number().int().min(1).max(100).optional(),
});
export type ActionInputGetNewCards = z.infer<typeof schemaActionInputGetNewCards>;
export const validateActionInputGetNewCards = generateValidator(schemaActionInputGetNewCards);

export const schemaActionInputGetCardsByDeckId = z.object({
  deckId: z.number().int().positive(),
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional(),
  queue: z.union([
    z.enum(["USER_BURIED", "SCHED_BURIED", "SUSPENDED", "NEW", "LEARNING", "REVIEW", "IN_LEARNING", "PREVIEW"]),
    z.array(z.enum(["USER_BURIED", "SCHED_BURIED", "SUSPENDED", "NEW", "LEARNING", "REVIEW", "IN_LEARNING", "PREVIEW"])),
  ]).optional(),
});
export type ActionInputGetCardsByDeckId = z.infer<typeof schemaActionInputGetCardsByDeckId>;
export const validateActionInputGetCardsByDeckId = generateValidator(schemaActionInputGetCardsByDeckId);

export const schemaActionInputGetCardStats = z.object({
  deckId: z.number().int().positive(),
});
export type ActionInputGetCardStats = z.infer<typeof schemaActionInputGetCardStats>;
export const validateActionInputGetCardStats = generateValidator(schemaActionInputGetCardStats);

export const schemaActionInputDeleteCard = z.object({
  cardId: z.bigint(),
});
export type ActionInputDeleteCard = z.infer<typeof schemaActionInputDeleteCard>;
export const validateActionInputDeleteCard = generateValidator(schemaActionInputDeleteCard);

export const schemaActionInputGetCardById = z.object({
  cardId: z.bigint(),
});
export type ActionInputGetCardById = z.infer<typeof schemaActionInputGetCardById>;
export const validateActionInputGetCardById = generateValidator(schemaActionInputGetCardById);

export type ActionOutputCard = {
  id: string;
  noteId: string;
  deckId: number;
  ord: number;
  mod: number;
  usn: number;
  type: "NEW" | "LEARNING" | "REVIEW" | "RELEARNING";
  queue: "USER_BURIED" | "SCHED_BURIED" | "SUSPENDED" | "NEW" | "LEARNING" | "REVIEW" | "IN_LEARNING" | "PREVIEW";
  due: number;
  ivl: number;
  factor: number;
  reps: number;
  lapses: number;
  left: number;
  odue: number;
  odid: number;
  flags: number;
  data: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ActionOutputCardWithNote = ActionOutputCard & {
  note: {
    id: string;
    flds: string;
    sfld: string;
    tags: string;
  };
};

export type ActionOutputCardStats = {
  total: number;
  new: number;
  learning: number;
  review: number;
  due: number;
};

export type ActionOutputScheduledCard = {
  cardId: string;
  newType: "NEW" | "LEARNING" | "REVIEW" | "RELEARNING";
  newQueue: "USER_BURIED" | "SCHED_BURIED" | "SUSPENDED" | "NEW" | "LEARNING" | "REVIEW" | "IN_LEARNING" | "PREVIEW";
  newDue: number;
  newIvl: number;
  newFactor: number;
  newReps: number;
  newLapses: number;
  nextReviewDate: Date;
};

export type ActionOutputCreateCard = {
  success: boolean;
  message: string;
  data?: {
    cardId: string;
  };
};

export type ActionOutputAnswerCard = {
  success: boolean;
  message: string;
  data?: {
    card: ActionOutputCard;
    scheduled: ActionOutputScheduledCard;
  };
};

export type ActionOutputGetCards = {
  success: boolean;
  message: string;
  data?: ActionOutputCard[];
};

export type ActionOutputGetCardsWithNote = {
  success: boolean;
  message: string;
  data?: ActionOutputCardWithNote[];
};

export type ActionOutputGetCardStats = {
  success: boolean;
  message: string;
  data?: ActionOutputCardStats;
};

export type ActionOutputDeleteCard = {
  success: boolean;
  message: string;
};

export type ActionOutputGetCardById = {
  success: boolean;
  message: string;
  data?: ActionOutputCardWithNote;
};

export const schemaActionInputResetDeckCards = z.object({
  deckId: z.number().int().positive(),
});
export type ActionInputResetDeckCards = z.infer<typeof schemaActionInputResetDeckCards>;
export const validateActionInputResetDeckCards = generateValidator(schemaActionInputResetDeckCards);

export const schemaActionInputGetTodayStudyStats = z.object({
  deckId: z.number().int().positive(),
});
export type ActionInputGetTodayStudyStats = z.infer<typeof schemaActionInputGetTodayStudyStats>;
export const validateActionInputGetTodayStudyStats = generateValidator(schemaActionInputGetTodayStudyStats);

export type ActionOutputGetTodayStudyStats = {
  success: boolean;
  message: string;
  data?: ActionOutputTodayStudyStats;
};
export type ActionOutputTodayStudyStats = {
  newStudied: number;
  reviewStudied: number;
  learningStudied: number;
  totalStudied: number;
};

export type ActionOutputResetDeckCards = {
  success: boolean;
  message: string;
  data?: {
    count: number;
  };
};
