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
  ServiceOutputCard,
  ServiceOutputCardWithNote,
  ServiceOutputCardStats,
  ServiceOutputScheduledCard,
  ServiceOutputReviewResult,
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

function scheduleNewCard(ease: ReviewEase, factor: number): {
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
      newFactor: Math.max(SM2_CONFIG.MINIMUM_FACTOR, factor + SM2_CONFIG.FACTOR_ADJUSTMENTS[1]),
    };
  }

  const ivl = SM2_CONFIG.INITIAL_INTERVALS[ease];
  return {
    type: CardType.REVIEW,
    queue: CardQueue.REVIEW,
    ivl,
    due: calculateDueDate(ivl),
    newFactor: Math.max(SM2_CONFIG.MINIMUM_FACTOR, factor + SM2_CONFIG.FACTOR_ADJUSTMENTS[ease]),
  };
}

function scheduleLearningCard(ease: ReviewEase, factor: number, left: number): {
  type: CardType;
  queue: CardQueue;
  ivl: number;
  due: number;
  newFactor: number;
  newLeft: number;
} {
  if (ease === 1) {
    return {
      type: CardType.LEARNING,
      queue: CardQueue.LEARNING,
      ivl: 0,
      due: Math.floor(Date.now() / 1000) + SM2_CONFIG.LEARNING_STEPS[0] * 60,
      newFactor: Math.max(SM2_CONFIG.MINIMUM_FACTOR, factor + SM2_CONFIG.FACTOR_ADJUSTMENTS[1]),
      newLeft: SM2_CONFIG.LEARNING_STEPS.length * 1000 + SM2_CONFIG.LEARNING_STEPS.length,
    };
  }

  const stepIndex = Math.floor(left % 1000);
  if (ease === 2 && stepIndex < SM2_CONFIG.LEARNING_STEPS.length - 1) {
    const nextStep = stepIndex + 1;
    return {
      type: CardType.LEARNING,
      queue: CardQueue.LEARNING,
      ivl: 0,
      due: Math.floor(Date.now() / 1000) + SM2_CONFIG.LEARNING_STEPS[nextStep] * 60,
      newFactor: Math.max(SM2_CONFIG.MINIMUM_FACTOR, factor + SM2_CONFIG.FACTOR_ADJUSTMENTS[2]),
      newLeft: nextStep * 1000 + (SM2_CONFIG.LEARNING_STEPS.length - nextStep),
    };
  }

  const ivl = ease === 4 ? SM2_CONFIG.GRADUATING_INTERVAL_EASY : SM2_CONFIG.GRADUATING_INTERVAL_GOOD;
  return {
    type: CardType.REVIEW,
    queue: CardQueue.REVIEW,
    ivl,
    due: calculateDueDate(ivl),
    newFactor: Math.max(SM2_CONFIG.MINIMUM_FACTOR, factor + SM2_CONFIG.FACTOR_ADJUSTMENTS[ease]),
    newLeft: 0,
  };
}

function scheduleReviewCard(
  ease: ReviewEase,
  ivl: number,
  factor: number,
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
    return {
      type: CardType.RELEARNING,
      queue: CardQueue.LEARNING,
      ivl: 0,
      due: Math.floor(Date.now() / 1000) + SM2_CONFIG.LEARNING_STEPS[0] * 60,
      newFactor: Math.max(SM2_CONFIG.MINIMUM_FACTOR, factor + SM2_CONFIG.FACTOR_ADJUSTMENTS[1]),
      newLapses: lapses + 1,
    };
  }

  const newFactor = Math.max(SM2_CONFIG.MINIMUM_FACTOR, factor + SM2_CONFIG.FACTOR_ADJUSTMENTS[ease]);
  const factorMultiplier = newFactor / 1000;
  let newIvl = Math.floor(ivl * factorMultiplier);

  if (ease === 2) {
    newIvl = Math.max(1, Math.floor(newIvl * 1.2));
  } else if (ease === 4) {
    newIvl = Math.floor(newIvl * 1.3);
  }

  newIvl = Math.max(1, newIvl);

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
      left: result.type === CardType.LEARNING ? SM2_CONFIG.LEARNING_STEPS.length * 1000 + SM2_CONFIG.LEARNING_STEPS.length : 0,
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
    const result = scheduleLearningCard(ease, card.factor, card.left);
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
      left: result.type === CardType.RELEARNING ? SM2_CONFIG.LEARNING_STEPS.length * 1000 + SM2_CONFIG.LEARNING_STEPS.length : 0,
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
