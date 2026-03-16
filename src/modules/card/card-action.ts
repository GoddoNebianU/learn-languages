"use server";

import { auth } from "@/auth";
import { headers } from "next/headers";
import { createLogger } from "@/lib/logger";
import { ValidateError } from "@/lib/errors";
import {
  ActionInputCreateCard,
  ActionInputAnswerCard,
  ActionInputGetCardsForReview,
  ActionInputGetNewCards,
  ActionInputGetCardsByDeckId,
  ActionInputGetCardStats,
  ActionInputDeleteCard,
  ActionInputGetCardById,
  ActionInputResetDeckCards,
  ActionInputGetTodayStudyStats,
  ActionOutputCreateCard,
  ActionOutputAnswerCard,
  ActionOutputGetCards,
  ActionOutputGetCardsWithNote,
  ActionOutputGetCardStats,
  ActionOutputDeleteCard,
  ActionOutputGetCardById,
  ActionOutputResetDeckCards,
  ActionOutputCard,
  ActionOutputCardWithNote,
  ActionOutputScheduledCard,
  ActionOutputGetTodayStudyStats,
  validateActionInputCreateCard,
  validateActionInputAnswerCard,
  validateActionInputGetCardsForReview,
  validateActionInputGetNewCards,
  validateActionInputGetCardsByDeckId,
  validateActionInputGetCardStats,
  validateActionInputDeleteCard,
  validateActionInputGetCardById,
  validateActionInputResetDeckCards,
  validateActionInputGetTodayStudyStats,
} from "./card-action-dto";
import {
  serviceCreateCard,
  serviceAnswerCard,
  serviceGetCardsForReview,
  serviceGetNewCards,
  serviceGetCardsByDeckId,
  serviceGetCardsByDeckIdWithNotes,
  serviceGetCardStats,
  serviceDeleteCard,
  serviceGetCardByIdWithNote,
  serviceCheckCardOwnership,
  serviceResetDeckCards,
  serviceGetTodayStudyStats,
} from "./card-service";
import { CardQueue } from "../../../generated/prisma/enums";

const log = createLogger("card-action");

function mapCardToOutput(card: {
  id: bigint;
  noteId: bigint;
  deckId: number;
  ord: number;
  mod: number;
  usn: number;
  type: string;
  queue: string;
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
}): ActionOutputCard {
  return {
    id: card.id.toString(),
    noteId: card.noteId.toString(),
    deckId: card.deckId,
    ord: card.ord,
    mod: card.mod,
    usn: card.usn,
    type: card.type as ActionOutputCard["type"],
    queue: card.queue as ActionOutputCard["queue"],
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

function mapCardWithNoteToOutput(card: {
  id: bigint;
  noteId: bigint;
  deckId: number;
  ord: number;
  mod: number;
  usn: number;
  type: string;
  queue: string;
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
  note: {
    id: bigint;
    flds: string;
    sfld: string;
    tags: string;
  };
}): ActionOutputCardWithNote {
  return {
    ...mapCardToOutput(card),
    note: {
      id: card.note.id.toString(),
      flds: card.note.flds,
      sfld: card.note.sfld,
      tags: card.note.tags,
    },
  };
}

function mapScheduledToOutput(scheduled: {
  cardId: bigint;
  newType: string;
  newQueue: string;
  newDue: number;
  newIvl: number;
  newFactor: number;
  newReps: number;
  newLapses: number;
  nextReviewDate: Date;
}): ActionOutputScheduledCard {
  return {
    cardId: scheduled.cardId.toString(),
    newType: scheduled.newType as ActionOutputScheduledCard["newType"],
    newQueue: scheduled.newQueue as ActionOutputScheduledCard["newQueue"],
    newDue: scheduled.newDue,
    newIvl: scheduled.newIvl,
    newFactor: scheduled.newFactor,
    newReps: scheduled.newReps,
    newLapses: scheduled.newLapses,
    nextReviewDate: scheduled.nextReviewDate,
  };
}

async function checkCardOwnership(cardId: bigint): Promise<boolean> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return false;

  return serviceCheckCardOwnership({ cardId, userId: session.user.id });
}

async function getCurrentUserId(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user?.id ?? null;
}

export async function actionCreateCard(
  input: unknown,
): Promise<ActionOutputCreateCard> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, message: "Unauthorized" };
    }

    const validated = validateActionInputCreateCard(input);
    const cardId = await serviceCreateCard(validated);

    return {
      success: true,
      message: "Card created successfully",
      data: { cardId: cardId.toString() },
    };
  } catch (e) {
    if (e instanceof ValidateError) {
      return { success: false, message: e.message };
    }
    log.error("Failed to create card", { error: e });
    return { success: false, message: "An error occurred while creating the card" };
  }
}

export async function actionAnswerCard(
  input: unknown,
): Promise<ActionOutputAnswerCard> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, message: "Unauthorized" };
    }

    const validated = validateActionInputAnswerCard(input);

    const isOwner = await checkCardOwnership(validated.cardId);
    if (!isOwner) {
      return { success: false, message: "You do not have permission to answer this card" };
    }

    const result = await serviceAnswerCard(validated);

    return {
      success: true,
      message: "Card answered successfully",
      data: {
        card: mapCardToOutput(result.card),
        scheduled: mapScheduledToOutput(result.scheduled),
      },
    };
  } catch (e) {
    if (e instanceof ValidateError) {
      return { success: false, message: e.message };
    }
    log.error("Failed to answer card", { error: e });
    return { success: false, message: "An error occurred while answering the card" };
  }
}

export async function actionGetCardsForReview(
  input: unknown,
): Promise<ActionOutputGetCardsWithNote> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, message: "Unauthorized" };
    }

    const validated = validateActionInputGetCardsForReview(input);
    const cards = await serviceGetCardsForReview(validated);

    return {
      success: true,
      message: "Cards fetched successfully",
      data: cards.map(mapCardWithNoteToOutput),
    };
  } catch (e) {
    if (e instanceof ValidateError) {
      return { success: false, message: e.message };
    }
    log.error("Failed to get cards for review", { error: e });
    return { success: false, message: "An error occurred while fetching cards" };
  }
}

export async function actionGetNewCards(
  input: unknown,
): Promise<ActionOutputGetCardsWithNote> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, message: "Unauthorized" };
    }

    const validated = validateActionInputGetNewCards(input);
    const cards = await serviceGetNewCards(validated);

    return {
      success: true,
      message: "New cards fetched successfully",
      data: cards.map(mapCardWithNoteToOutput),
    };
  } catch (e) {
    if (e instanceof ValidateError) {
      return { success: false, message: e.message };
    }
    log.error("Failed to get new cards", { error: e });
    return { success: false, message: "An error occurred while fetching new cards" };
  }
}

export async function actionGetCardsByDeckId(
  input: unknown,
): Promise<ActionOutputGetCards> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, message: "Unauthorized" };
    }

    const validated = validateActionInputGetCardsByDeckId(input);
    const queue = validated.queue as CardQueue | CardQueue[] | undefined;
    const cards = await serviceGetCardsByDeckId({
      ...validated,
      queue,
    });

    return {
      success: true,
      message: "Cards fetched successfully",
      data: cards.map(mapCardToOutput),
    };
  } catch (e) {
    if (e instanceof ValidateError) {
      return { success: false, message: e.message };
    }
    log.error("Failed to get cards by deck", { error: e });
    return { success: false, message: "An error occurred while fetching cards" };
  }
}

export async function actionGetCardsByDeckIdWithNotes(
  input: unknown,
): Promise<ActionOutputGetCardsWithNote> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, message: "Unauthorized" };
    }

    const validated = validateActionInputGetCardsByDeckId(input);
    const queue = validated.queue as CardQueue | CardQueue[] | undefined;
    const cards = await serviceGetCardsByDeckIdWithNotes({
      ...validated,
      queue,
    });

    return {
      success: true,
      message: "Cards fetched successfully",
      data: cards.map(mapCardWithNoteToOutput),
    };
  } catch (e) {
    if (e instanceof ValidateError) {
      return { success: false, message: e.message };
    }
    log.error("Failed to get cards by deck with notes", { error: e });
    return { success: false, message: "An error occurred while fetching cards" };
  }
}

export async function actionGetCardStats(
  input: unknown,
): Promise<ActionOutputGetCardStats> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, message: "Unauthorized" };
    }

    const validated = validateActionInputGetCardStats(input);
    const stats = await serviceGetCardStats(validated);

    return {
      success: true,
      message: "Card stats fetched successfully",
      data: stats,
    };
  } catch (e) {
    if (e instanceof ValidateError) {
      return { success: false, message: e.message };
    }
    log.error("Failed to get card stats", { error: e });
    return { success: false, message: "An error occurred while fetching card stats" };
  }
}

export async function actionDeleteCard(
  input: unknown,
): Promise<ActionOutputDeleteCard> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, message: "Unauthorized" };
    }

    const validated = validateActionInputDeleteCard(input);

    const isOwner = await checkCardOwnership(validated.cardId);
    if (!isOwner) {
      return { success: false, message: "You do not have permission to delete this card" };
    }

    await serviceDeleteCard(validated.cardId);

    return { success: true, message: "Card deleted successfully" };
  } catch (e) {
    if (e instanceof ValidateError) {
      return { success: false, message: e.message };
    }
    log.error("Failed to delete card", { error: e });
    return { success: false, message: "An error occurred while deleting the card" };
  }
}

export async function actionGetCardById(
  input: unknown,
): Promise<ActionOutputGetCardById> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, message: "Unauthorized" };
    }

    const validated = validateActionInputGetCardById(input);
    const card = await serviceGetCardByIdWithNote(validated.cardId);

    if (!card) {
      return { success: false, message: "Card not found" };
    }

    return {
      success: true,
      message: "Card fetched successfully",
      data: mapCardWithNoteToOutput(card),
    };
  } catch (e) {
    if (e instanceof ValidateError) {
      return { success: false, message: e.message };
    }
    log.error("Failed to get card by id", { error: e });
    return { success: false, message: "An error occurred while fetching the card" };
  }
}

export async function actionGetTodayStudyStats(
  input: ActionInputGetTodayStudyStats,
): Promise<ActionOutputGetTodayStudyStats> {
  try {
    const validated = validateActionInputGetTodayStudyStats(input);
    const stats = await serviceGetTodayStudyStats({ deckId: validated.deckId });
    
 return {
      success: true,
      message: "Today's study stats fetched successfully",
      data: stats,
    };
  } catch (e) {
    if (e instanceof ValidateError) {
      return { success: false, message: e.message };
    }
    log.error("Failed to get today study stats", { error: e });
    return { success: false, message: "An error occurred while fetching study stats" };
  }
}

export async function actionResetDeckCards(
  input: ActionInputResetDeckCards,
): Promise<ActionOutputResetDeckCards> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, message: "Unauthorized", data: { count: 0 } };
    }

    const validated = validateActionInputResetDeckCards(input);
    const result = await serviceResetDeckCards({
      deckId: validated.deckId,
      userId,
    });

    if (!result.success) {
      return { success: false, message: result.message, data: { count: 0 } };
    }

    return {
      success: true,
      message: result.message,
      data: { count: result.count },
    };
  } catch (e) {
    if (e instanceof ValidateError) {
      return { success: false, message: e.message, data: { count: 0 } };
    }
    log.error("Failed to reset deck cards", { error: e });
    return { success: false, message: "An error occurred while resetting deck cards", data: { count: 0 } };
  }
}
