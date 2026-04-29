"use server";

import { getCurrentUserId } from "@/modules/shared/action-utils";
import { createLogger } from "@/lib/logger";
import { ValidateError } from "@/lib/errors";
import {
  serviceCreateCard,
  serviceUpdateCard,
  serviceDeleteCard,
  serviceGetCardById,
  serviceGetCardsByDeckId,
  serviceGetRandomCard,
  serviceCheckDeckOwnership,
  serviceCheckCardExistsByWord,
} from "./card-service";
import type { ActionOutputCard } from "./card-action-dto";
import type { RepoOutputCard } from "./card-repository-dto";
import {
  validateActionInputCreateCard,
  validateActionInputUpdateCard,
  validateActionInputDeleteCard,
  validateActionInputGetCardsByDeckId,
  validateActionInputGetRandomCard,
  validateActionInputCheckCardExistsByWord,
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
    createdAt: card.createdAt,
    updatedAt: card.updatedAt,
  };
}

async function checkDeckOwnership(deckId: number): Promise<boolean> {
  const userId = await getCurrentUserId();
  if (!userId) return false;
  return serviceCheckDeckOwnership({ deckId, userId });
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
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, message: "Unauthorized" };
    }
    const validated = validateActionInputGetCardsByDeckId(input);
    const isOwner = await checkDeckOwnership(validated.deckId);
    if (!isOwner) {
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
