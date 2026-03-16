import { CardType, CardQueue } from "../../../generated/prisma/enums";

export type ReviewEase = 1 | 2 | 3 | 4;

export interface ServiceInputCreateCard {
  noteId: bigint;
  deckId: number;
  ord?: number;
}

export interface ServiceInputAnswerCard {
  cardId: bigint;
  ease: ReviewEase;
}

export interface ServiceInputGetCardsForReview {
  deckId: number;
  limit?: number;
}

export interface ServiceInputGetNewCards {
  deckId: number;
  limit?: number;
}

export interface ServiceInputGetCardsByDeckId {
  deckId: number;
  limit?: number;
  offset?: number;
  queue?: CardQueue | CardQueue[];
}

export interface ServiceInputGetCardStats {
  deckId: number;
}

export interface ServiceInputCheckCardOwnership {
  cardId: bigint;
  userId: string;
}

export type ServiceOutputCheckCardOwnership = boolean;

export type ServiceOutputCard = {
  id: bigint;
  noteId: bigint;
  deckId: number;
  ord: number;
  mod: number;
  usn: number;
  type: CardType;
  queue: CardQueue;
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

export type ServiceOutputCardWithNote = ServiceOutputCard & {
  note: {
    id: bigint;
    flds: string;
    sfld: string;
    tags: string;
  };
};

export type ServiceOutputCardStats = {
  total: number;
  new: number;
  learning: number;
  review: number;
  due: number;
};

export type ServiceOutputScheduledCard = {
  cardId: bigint;
  newType: CardType;
  newQueue: CardQueue;
  newDue: number;
  newIvl: number;
  newFactor: number;
  newReps: number;
  newLapses: number;
  nextReviewDate: Date;
};

export type ServiceOutputReviewResult = {
  success: boolean;
  card: ServiceOutputCard;
  scheduled: ServiceOutputScheduledCard;
};

export interface ServiceInputResetDeckCards {
  deckId: number;
  userId: string;
}

export interface ServiceInputCheckDeckOwnership {
  deckId: number;
  userId: string;
}

export type ServiceOutputCheckDeckOwnership = boolean;

export type ServiceOutputResetDeckCards = {
  success: boolean;
  count: number;
  message: string;
};

export type ServiceInputGetTodayStudyStats = {
  deckId: number;
};

export type ServiceOutputTodayStudyStats = {
  newStudied: number;
  reviewStudied: number;
  learningStudied: number;
  totalStudied: number;
};

export const SM2_CONFIG = {
  LEARNING_STEPS: [1, 10],
  RELEARNING_STEPS: [10],
  GRADUATING_INTERVAL_GOOD: 1,
  GRADUATING_INTERVAL_EASY: 4,
  EASY_INTERVAL: 4,
  MINIMUM_FACTOR: 1300,
  DEFAULT_FACTOR: 2500,
  MAXIMUM_INTERVAL: 36500,
  EASY_BONUS: 1.3,
  HARD_INTERVAL: 1.2,
  NEW_INTERVAL: 0.0,
  INTERVAL_MODIFIER: 1.0,
  FACTOR_ADJUSTMENTS: {
    1: -200,
    2: -150,
    3: 0,
    4: 150,
  },
  INITIAL_INTERVALS: {
    2: 1,
    3: 3,
    4: 4,
  },
} as const;
