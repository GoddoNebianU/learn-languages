"use server";

import { getCurrentUserId } from "@/modules/shared/action-utils";
import { repoIsDeckPublic } from "@/modules/deck/deck-repository";
import { createLogger } from "@/lib/logger";
import { ValidateError } from "@/lib/errors";
import { logActivity } from "@/modules/activity/activity-service";
import { ACTIVITY_ACTIONS } from "@/modules/activity/activity-constants";
import {
  serviceCreateCard,
  serviceUpdateCard,
  serviceDeleteCard,
  serviceGetCardById,
  serviceGetCardsByDeckId,
  serviceGetRandomCard,
  serviceGetCardStats,
  serviceCheckDeckOwnership,
  serviceCheckCardExistsByWord,
  serviceGetCardByWord,
  serviceReorderCards,
} from "./card-service";
import type {
  ActionOutputCard,
  ActionOutputGetCardByWord,
  ActionOutputGetCardCount,
} from "./card-action-dto";
import type { RepoOutputCard } from "./card-repository-dto";
import {
  validateActionInputCreateCard,
  validateActionInputUpdateCard,
  validateActionInputDeleteCard,
  validateActionInputGetCardsByDeckId,
  validateActionInputGetRandomCard,
  validateActionInputCheckCardExistsByWord,
  validateActionInputGetCardCount,
  validateActionInputReorderCards,
} from "./card-action-dto";

const log = createLogger("card-action");

function mapCardToOutput(card: RepoOutputCard): ActionOutputCard {
  return {
    id: card.id,
    deckId: card.deckId,
    word: card.word,
    ipa: card.ipa,
    queryLang: card.queryLang,
    cardType: card.cardType,
    meanings: card.meanings,
    hidden: card.hidden,
    createdAt: card.createdAt,
    updatedAt: card.updatedAt,
  };
}

async function checkDeckOwnership(deckId: number): Promise<boolean> {
  const userId = await getCurrentUserId();
  if (!userId) return false;
  return serviceCheckDeckOwnership({ deckId, userId });
}

async function checkDeckAccess(deckId: number): Promise<boolean> {
  const userId = await getCurrentUserId();
  if (userId) {
    const isOwner = await serviceCheckDeckOwnership({ deckId, userId });
    if (isOwner) return true;
  }
  return repoIsDeckPublic(deckId);
}

export async function actionCreateCard(input: unknown) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, message: "Unauthorized" };
    }
    const validated = validateActionInputCreateCard(input);
    const isOwner = await checkDeckOwnership(validated.deckId);
    if (!isOwner) {
      return { success: false, message: "You do not have permission to add cards to this deck" };
    }
    const result = await serviceCreateCard(validated);
    if (result.success) {
      await logActivity({
        userId,
        action: ACTIVITY_ACTIONS.CARD.CREATE,
        entityType: "card",
        entityId: result.cardId,
      });
    }
    return result;
  } catch (e) {
    if (e instanceof ValidateError) {
      return { success: false, message: e.message };
    }
    log.error("Failed to create card", { error: e instanceof Error ? e.message : String(e) });
    return { success: false, message: "Failed to create card" };
  }
}

export async function actionUpdateCard(input: unknown) {
  try {
    const validated = validateActionInputUpdateCard(input);
    const card = await serviceGetCardById(validated.cardId);
    if (!card) {
      return { success: false, message: "Card not found" };
    }
    const isOwner = await checkDeckOwnership(card.deckId);
    if (!isOwner) {
      return { success: false, message: "You do not have permission to update this card" };
    }
    const result = await serviceUpdateCard(validated);
    if (result.success) {
      await logActivity({
        userId: await getCurrentUserId(),
        action: ACTIVITY_ACTIONS.CARD.UPDATE,
        entityType: "card",
        entityId: validated.cardId,
      });
    }
    return result;
  } catch (e) {
    if (e instanceof ValidateError) {
      return { success: false, message: e.message };
    }
    log.error("Failed to update card", { error: e instanceof Error ? e.message : String(e) });
    return { success: false, message: "Failed to update card" };
  }
}

export async function actionDeleteCard(input: unknown) {
  try {
    const validated = validateActionInputDeleteCard(input);
    const card = await serviceGetCardById(validated.cardId);
    if (!card) {
      return { success: false, message: "Card not found" };
    }
    const isOwner = await checkDeckOwnership(card.deckId);
    if (!isOwner) {
      return { success: false, message: "You do not have permission to delete this card" };
    }
    const result = await serviceDeleteCard(validated);
    if (result.success) {
      await logActivity({
        userId: await getCurrentUserId(),
        action: ACTIVITY_ACTIONS.CARD.DELETE,
        entityType: "card",
        entityId: validated.cardId,
      });
    }
    return result;
  } catch (e) {
    if (e instanceof ValidateError) {
      return { success: false, message: e.message };
    }
    log.error("Failed to delete card", { error: e instanceof Error ? e.message : String(e) });
    return { success: false, message: "Failed to delete card" };
  }
}

export async function actionGetCardsByDeckId(input: unknown) {
  try {
    const validated = validateActionInputGetCardsByDeckId(input);
    const hasAccess = await checkDeckAccess(validated.deckId);
    if (!hasAccess) {
      return { success: false, message: "You do not have permission to view cards in this deck" };
    }
    const cards = await serviceGetCardsByDeckId(validated);
    return {
      success: true,
      message: "Cards fetched successfully",
      data: cards.map(mapCardToOutput),
    };
  } catch (e) {
    if (e instanceof ValidateError) {
      return { success: false, message: e.message };
    }
    log.error("Failed to get cards", { error: e instanceof Error ? e.message : String(e) });
    return { success: false, message: "Failed to get cards" };
  }
}

export async function actionGetCardCount(input: unknown): Promise<ActionOutputGetCardCount> {
  try {
    const validated = validateActionInputGetCardCount(input);
    const hasAccess = await checkDeckAccess(validated.deckId);
    if (!hasAccess) {
      return { success: false, message: "You do not have permission to view cards in this deck" };
    }
    const stats = await serviceGetCardStats(validated.deckId, validated.includeHidden ?? false);
    return {
      success: true,
      message: "Card count fetched",
      data: { total: stats.total },
    };
  } catch (e) {
    if (e instanceof ValidateError) {
      return { success: false, message: e.message };
    }
    log.error("Failed to get card count", { error: e instanceof Error ? e.message : String(e) });
    return { success: false, message: "Failed to get card count" };
  }
}

export async function actionGetRandomCard(input: unknown) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, message: "Unauthorized" };
    }
    const validated = validateActionInputGetRandomCard(input);
    const isOwner = await checkDeckOwnership(validated.deckId);
    if (!isOwner) {
      return { success: false, message: "You do not have permission to view cards in this deck" };
    }
    const card = await serviceGetRandomCard(validated);
    if (!card) {
      return { success: false, message: "No cards available" };
    }
    return {
      success: true,
      message: "Random card fetched successfully",
      data: mapCardToOutput(card),
    };
  } catch (e) {
    if (e instanceof ValidateError) {
      return { success: false, message: e.message };
    }
    log.error("Failed to get random card", { error: e instanceof Error ? e.message : String(e) });
    return { success: false, message: "Failed to get random card" };
  }
}

export async function actionCheckCardExistsByWord(input: unknown) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, message: "Unauthorized" };
    }
    const validated = validateActionInputCheckCardExistsByWord(input);
    const isOwner = await checkDeckOwnership(validated.deckId);
    if (!isOwner) {
      return { success: false, message: "You do not have permission to check this deck" };
    }
    const exists = await serviceCheckCardExistsByWord({
      deckId: validated.deckId,
      word: validated.word,
    });
    return {
      success: true,
      message: exists ? "Card already exists" : "Card does not exist",
      data: { exists },
    };
  } catch (e) {
    if (e instanceof ValidateError) {
      return { success: false, message: e.message };
    }
    log.error("Failed to check card existence", { error: e instanceof Error ? e.message : String(e) });
    return { success: false, message: "Failed to check card existence" };
  }
}

export async function actionGetCardByWord(input: unknown): Promise<ActionOutputGetCardByWord> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, message: "Unauthorized" };
    }
    const validated = validateActionInputCheckCardExistsByWord(input);
    const isOwner = await checkDeckOwnership(validated.deckId);
    if (!isOwner) {
      return { success: false, message: "You do not have permission to check this deck" };
    }
    const card = await serviceGetCardByWord({
      deckId: validated.deckId,
      word: validated.word,
    });
    if (!card) {
      return { success: true, message: "Card not found", data: undefined };
    }
    return {
      success: true,
      message: "Card found",
      data: mapCardToOutput(card),
    };
  } catch (e) {
    if (e instanceof ValidateError) {
      return { success: false, message: e.message };
    }
    log.error("Failed to get card by word", { error: e instanceof Error ? e.message : String(e) });
    return { success: false, message: "Failed to get card by word" };
  }
}

export async function actionReorderCards(
  input: unknown
): Promise<{ success: boolean; message: string }> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, message: "Unauthorized" };
    }
    const validated = validateActionInputReorderCards(input);
    const isOwner = await checkDeckOwnership(validated.deckId);
    if (!isOwner) {
      return { success: false, message: "You do not have permission to reorder cards in this deck" };
    }
    const result = await serviceReorderCards(validated.deckId, validated.cardIds);
    if (result.success) {
      await logActivity({
        userId,
        action: ACTIVITY_ACTIONS.CARD.REORDER,
        entityType: "deck",
        entityId: validated.deckId,
        metadata: { count: validated.cardIds.length },
      });
    }
    return result;
  } catch (e) {
    if (e instanceof ValidateError) {
      return { success: false, message: e.message };
    }
    log.error("Failed to reorder cards", { error: e instanceof Error ? e.message : String(e) });
    return { success: false, message: "Failed to reorder cards" };
  }
}
