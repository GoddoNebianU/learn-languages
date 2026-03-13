import { createLogger } from "@/lib/logger";
import {
  repoCreateCard,
  repoUpdateCard,
  repoGetCardById,
  repoGetCardByIdWithNote,
  repoGetCardsByDeckId,
  repoGetCardsByDeckIdWithNotes,
  repoGetCardsForReview,
  repoGetNewCards,
  repoGetCardStats,
  repoDeleteCard,
  repoGetCardsByNoteId,
  repoGetCardDeckOwnerId,
} from "./card-repository";
import {
  RepoInputUpdateCard,
  RepoOutputCard,
} from "./card-repository-dto";
import {
  ServiceInputCreateCard,
  ServiceInputAnswerCard,
  ServiceInputGetCardsForReview,
  ServiceInputGetNewCards,
  ServiceInputGetCardsByDeckId,
  ServiceInputGetCardStats,
  ServiceInputCheckCardOwnership,
  ServiceOutputCard,
  ServiceOutputCardWithNote,
  ServiceOutputCardStats,
  ServiceOutputScheduledCard,
  ServiceOutputReviewResult,
  ServiceOutputCheckCardOwnership,
  ReviewEase,
  SM2_CONFIG,
} from "./card-service-dto";
import { CardType, CardQueue } from "../../../generated/prisma/enums";

const log = createLogger("card-service");

function generateCardId(): bigint {
  return BigInt(Date.now());
}

function calculateDueDate(intervalDays: number): number {
  const now = Math.floor(Date.now() / 1000);
  const todayStart = Math.floor(now / 86400) * 86400;
  return Math.floor(todayStart / 86400) + intervalDays;
}

function calculateNextReviewTime(intervalDays: number): Date {
  const now = Date.now();
  return new Date(now + intervalDays * 86400 * 1000);
}

function clampInterval(interval: number): number {
  return Math.min(Math.max(1, interval), SM2_CONFIG.MAXIMUM_INTERVAL);
}

function scheduleNewCard(ease: ReviewEase, currentFactor: number): {
  type: CardType;
  queue: CardQueue;
  ivl: number;
  due: number;
  newFactor: number;
} {
  if (ease === 1) {
    return {
      type: CardType.LEARNING,
      queue: CardQueue.LEARNING,
      ivl: 0,
      due: Math.floor(Date.now() / 1000) + SM2_CONFIG.LEARNING_STEPS[0] * 60,
      newFactor: currentFactor,
    };
  }

  if (ease === 2) {
    if (SM2_CONFIG.LEARNING_STEPS.length >= 2) {
      const avgStep = (SM2_CONFIG.LEARNING_STEPS[0] + SM2_CONFIG.LEARNING_STEPS[1]) / 2;
      return {
        type: CardType.LEARNING,
        queue: CardQueue.LEARNING,
        ivl: 0,
        due: Math.floor(Date.now() / 1000) + avgStep * 60,
        newFactor: currentFactor,
      };
    }
    return {
      type: CardType.LEARNING,
      queue: CardQueue.LEARNING,
      ivl: 0,
      due: Math.floor(Date.now() / 1000) + SM2_CONFIG.LEARNING_STEPS[0] * 60,
      newFactor: currentFactor,
    };
  }

  if (ease === 3) {
    if (SM2_CONFIG.LEARNING_STEPS.length >= 2) {
      return {
        type: CardType.LEARNING,
        queue: CardQueue.LEARNING,
        ivl: 0,
        due: Math.floor(Date.now() / 1000) + SM2_CONFIG.LEARNING_STEPS[1] * 60,
        newFactor: currentFactor,
      };
    }
    const ivl = SM2_CONFIG.GRADUATING_INTERVAL_GOOD;
    return {
      type: CardType.REVIEW,
      queue: CardQueue.REVIEW,
      ivl,
      due: calculateDueDate(ivl),
      newFactor: SM2_CONFIG.DEFAULT_FACTOR,
    };
  }

  const ivl = SM2_CONFIG.EASY_INTERVAL;
  const newFactor = SM2_CONFIG.DEFAULT_FACTOR + SM2_CONFIG.FACTOR_ADJUSTMENTS[4];
  
  return {
    type: CardType.REVIEW,
    queue: CardQueue.REVIEW,
    ivl,
    due: calculateDueDate(ivl),
    newFactor: Math.max(SM2_CONFIG.MINIMUM_FACTOR, newFactor),
  };
}

function scheduleLearningCard(ease: ReviewEase, currentFactor: number, left: number, isRelearning: boolean): {
  type: CardType;
  queue: CardQueue;
  ivl: number;
  due: number;
  newFactor: number;
  newLeft: number;
} {
  const steps = isRelearning ? SM2_CONFIG.RELEARNING_STEPS : SM2_CONFIG.LEARNING_STEPS;
  const totalSteps = steps.length;
  const cardType = isRelearning ? CardType.RELEARNING : CardType.LEARNING;
  
  if (ease === 1) {
    return {
      type: cardType,
      queue: CardQueue.LEARNING,
      ivl: 0,
      due: Math.floor(Date.now() / 1000) + steps[0] * 60,
      newFactor: currentFactor,
      newLeft: totalSteps * 1000,
    };
  }

  const stepIndex = Math.floor(left % 1000);
  
  if (ease === 2) {
    if (stepIndex === 0 && steps.length >= 2) {
      const step0 = steps[0] ?? 1;
      const step1 = steps[1] ?? step0;
      const avgStep = (step0 + step1) / 2;
      return {
        type: cardType,
        queue: CardQueue.LEARNING,
        ivl: 0,
        due: Math.floor(Date.now() / 1000) + avgStep * 60,
        newFactor: currentFactor,
        newLeft: left,
      };
    }
    const currentStepDelay = steps[stepIndex] ?? steps[0] ?? 1;
    return {
      type: cardType,
      queue: CardQueue.LEARNING,
      ivl: 0,
      due: Math.floor(Date.now() / 1000) + currentStepDelay * 60,
      newFactor: currentFactor,
      newLeft: left,
    };
  }

  if (ease === 3) {
    if (stepIndex < steps.length - 1) {
      const nextStep = stepIndex + 1;
      const nextStepDelay = steps[nextStep] ?? steps[0];
      return {
        type: cardType,
        queue: CardQueue.LEARNING,
        ivl: 0,
        due: Math.floor(Date.now() / 1000) + nextStepDelay * 60,
        newFactor: currentFactor,
        newLeft: nextStep * 1000 + (totalSteps - nextStep),
      };
    }
    
    const ivl = SM2_CONFIG.GRADUATING_INTERVAL_GOOD;
    return {
      type: CardType.REVIEW,
      queue: CardQueue.REVIEW,
      ivl,
      due: calculateDueDate(ivl),
      newFactor: SM2_CONFIG.DEFAULT_FACTOR,
      newLeft: 0,
    };
  }

  const ivl = SM2_CONFIG.GRADUATING_INTERVAL_EASY;
  const newFactor = SM2_CONFIG.DEFAULT_FACTOR + SM2_CONFIG.FACTOR_ADJUSTMENTS[4];
  
  return {
    type: CardType.REVIEW,
    queue: CardQueue.REVIEW,
    ivl,
    due: calculateDueDate(ivl),
    newFactor: Math.max(SM2_CONFIG.MINIMUM_FACTOR, newFactor),
    newLeft: 0,
  };
}

function scheduleReviewCard(
  ease: ReviewEase,
  currentIvl: number,
  currentFactor: number,
  lapses: number,
): {
  type: CardType;
  queue: CardQueue;
  ivl: number;
  due: number;
  newFactor: number;
  newLapses: number;
} {
  if (ease === 1) {
    const newFactor = Math.max(SM2_CONFIG.MINIMUM_FACTOR, currentFactor + SM2_CONFIG.FACTOR_ADJUSTMENTS[1]);
    const newIvl = Math.max(1, Math.floor(currentIvl * SM2_CONFIG.NEW_INTERVAL));
    return {
      type: CardType.RELEARNING,
      queue: CardQueue.LEARNING,
      ivl: newIvl,
      due: Math.floor(Date.now() / 1000) + SM2_CONFIG.RELEARNING_STEPS[0] * 60,
      newFactor,
      newLapses: lapses + 1,
    };
  }

  let newFactor: number;
  let newIvl: number;

  if (ease === 2) {
    newFactor = Math.max(SM2_CONFIG.MINIMUM_FACTOR, currentFactor + SM2_CONFIG.FACTOR_ADJUSTMENTS[2]);
    newIvl = Math.floor(currentIvl * SM2_CONFIG.HARD_INTERVAL * SM2_CONFIG.INTERVAL_MODIFIER);
  } else if (ease === 3) {
    newFactor = currentFactor;
    newIvl = Math.floor(currentIvl * (currentFactor / 1000) * SM2_CONFIG.INTERVAL_MODIFIER);
  } else {
    newIvl = Math.floor(currentIvl * (currentFactor / 1000) * SM2_CONFIG.EASY_BONUS * SM2_CONFIG.INTERVAL_MODIFIER);
    newFactor = Math.max(SM2_CONFIG.MINIMUM_FACTOR, currentFactor + SM2_CONFIG.FACTOR_ADJUSTMENTS[4]);
  }

  newIvl = clampInterval(newIvl);
  newIvl = Math.max(currentIvl + 1, newIvl);

  return {
    type: CardType.REVIEW,
    queue: CardQueue.REVIEW,
    ivl: newIvl,
    due: calculateDueDate(newIvl),
    newFactor,
    newLapses: lapses,
  };
}

function mapToServiceOutput(card: RepoOutputCard): ServiceOutputCard {
  return {
    id: card.id,
    noteId: card.noteId,
    deckId: card.deckId,
    ord: card.ord,
    mod: card.mod,
    usn: card.usn,
    type: card.type,
    queue: card.queue,
    due: card.due,
    ivl: card.ivl,
    factor: card.factor,
    reps: card.reps,
    lapses: card.lapses,
    left: card.left,
    odue: card.odue,
    odid: card.odid,
    flags: card.flags,
    data: card.data,
    createdAt: card.createdAt,
    updatedAt: card.updatedAt,
  };
}

export async function serviceCreateCard(
  input: ServiceInputCreateCard,
): Promise<bigint> {
  log.info("Creating card from note", { noteId: input.noteId.toString(), deckId: input.deckId });

  const existingCards = await repoGetCardsByNoteId(input.noteId);
  const maxOrd = existingCards.reduce((max, c) => Math.max(max, c.ord), -1);
  const ord = input.ord ?? maxOrd + 1;

  const cardId = await repoCreateCard({
    id: generateCardId(),
    noteId: input.noteId,
    deckId: input.deckId,
    ord,
    due: ord,
    type: CardType.NEW,
    queue: CardQueue.NEW,
  });

  log.info("Card created", { cardId: cardId.toString() });
  return cardId;
}

export async function serviceAnswerCard(
  input: ServiceInputAnswerCard,
): Promise<ServiceOutputReviewResult> {
  log.info("Answering card", { cardId: input.cardId.toString(), ease: input.ease });

  const card = await repoGetCardById(input.cardId);
  if (!card) {
    throw new Error(`Card not found: ${input.cardId.toString()}`);
  }

  const { ease } = input;
  let updateData: RepoInputUpdateCard;
  let scheduled: ServiceOutputScheduledCard;

  if (card.type === CardType.NEW) {
    const result = scheduleNewCard(ease, card.factor);
    updateData = {
      type: result.type,
      queue: result.queue,
      ivl: result.ivl,
      due: result.due,
      factor: result.newFactor,
      reps: card.reps + 1,
      left: result.type === CardType.LEARNING 
        ? SM2_CONFIG.LEARNING_STEPS.length * 1000
        : 0,
      mod: Math.floor(Date.now() / 1000),
    };
    scheduled = {
      cardId: card.id,
      newType: result.type,
      newQueue: result.queue,
      newDue: result.due,
      newIvl: result.ivl,
      newFactor: result.newFactor,
      newReps: card.reps + 1,
      newLapses: card.lapses,
      nextReviewDate: calculateNextReviewTime(result.ivl),
    };
  } else if (card.type === CardType.LEARNING || card.type === CardType.RELEARNING) {
    const result = scheduleLearningCard(ease, card.factor, card.left, card.type === CardType.RELEARNING);
    updateData = {
      type: result.type,
      queue: result.queue,
      ivl: result.ivl,
      due: result.due,
      factor: result.newFactor,
      reps: card.reps + 1,
      left: result.newLeft,
      mod: Math.floor(Date.now() / 1000),
    };
    scheduled = {
      cardId: card.id,
      newType: result.type,
      newQueue: result.queue,
      newDue: result.due,
      newIvl: result.ivl,
      newFactor: result.newFactor,
      newReps: card.reps + 1,
      newLapses: card.lapses,
      nextReviewDate: calculateNextReviewTime(result.ivl),
    };
  } else {
    const result = scheduleReviewCard(ease, card.ivl, card.factor, card.lapses);
    updateData = {
      type: result.type,
      queue: result.queue,
      ivl: result.ivl,
      due: result.due,
      factor: result.newFactor,
      reps: card.reps + 1,
      lapses: result.newLapses,
      left: result.type === CardType.RELEARNING 
        ? SM2_CONFIG.RELEARNING_STEPS.length * 1000
        : 0,
      mod: Math.floor(Date.now() / 1000),
    };
    scheduled = {
      cardId: card.id,
      newType: result.type,
      newQueue: result.queue,
      newDue: result.due,
      newIvl: result.ivl,
      newFactor: result.newFactor,
      newReps: card.reps + 1,
      newLapses: result.newLapses,
      nextReviewDate: calculateNextReviewTime(result.ivl),
    };
  }

  await repoUpdateCard(input.cardId, updateData);

  const updatedCard = await repoGetCardById(input.cardId);
  if (!updatedCard) {
    throw new Error(`Card not found after update: ${input.cardId.toString()}`);
  }

  log.info("Card answered and scheduled", {
    cardId: input.cardId.toString(),
    newType: scheduled.newType,
    newIvl: scheduled.newIvl,
    nextReview: scheduled.nextReviewDate.toISOString(),
  });

  return {
    success: true,
    card: mapToServiceOutput(updatedCard),
    scheduled,
  };
}

export async function serviceGetNextCardForReview(
  deckId: number,
): Promise<ServiceOutputCardWithNote | null> {
  log.debug("Getting next card for review", { deckId });
  const cards = await repoGetCardsForReview({ deckId, limit: 1 });
  return cards[0] ?? null;
}

export async function serviceGetCardsForReview(
  input: ServiceInputGetCardsForReview,
): Promise<ServiceOutputCardWithNote[]> {
  log.debug("Getting cards for review", { deckId: input.deckId });
  return repoGetCardsForReview(input);
}

export async function serviceGetNewCards(
  input: ServiceInputGetNewCards,
): Promise<ServiceOutputCardWithNote[]> {
  log.debug("Getting new cards", { deckId: input.deckId });
  return repoGetNewCards(input);
}

export async function serviceGetCardsByDeckId(
  input: ServiceInputGetCardsByDeckId,
): Promise<ServiceOutputCard[]> {
  log.debug("Getting cards by deck", { deckId: input.deckId });
  const cards = await repoGetCardsByDeckId(input);
  return cards.map(mapToServiceOutput);
}

export async function serviceGetCardsByDeckIdWithNotes(
  input: ServiceInputGetCardsByDeckId,
): Promise<ServiceOutputCardWithNote[]> {
  log.debug("Getting cards by deck with notes", { deckId: input.deckId });
  return repoGetCardsByDeckIdWithNotes(input);
}

export async function serviceGetCardById(
  cardId: bigint,
): Promise<ServiceOutputCard | null> {
  const card = await repoGetCardById(cardId);
  return card ? mapToServiceOutput(card) : null;
}

export async function serviceGetCardByIdWithNote(
  cardId: bigint,
): Promise<ServiceOutputCardWithNote | null> {
  return repoGetCardByIdWithNote(cardId);
}

export async function serviceGetCardStats(
  input: ServiceInputGetCardStats,
): Promise<ServiceOutputCardStats> {
  log.debug("Getting card stats", { deckId: input.deckId });
  return repoGetCardStats(input.deckId);
}

export async function serviceDeleteCard(cardId: bigint): Promise<void> {
  log.info("Deleting card", { cardId: cardId.toString() });
  await repoDeleteCard(cardId);
}

export async function serviceCheckCardOwnership(
  input: ServiceInputCheckCardOwnership,
): Promise<ServiceOutputCheckCardOwnership> {
  log.debug("Checking card ownership", { cardId: input.cardId.toString() });
  const ownerId = await repoGetCardDeckOwnerId(input.cardId);
  return ownerId === input.userId;
}
