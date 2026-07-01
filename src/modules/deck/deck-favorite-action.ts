"use server";

import { createLogger } from "@/lib/logger";
import { getCurrentUserId } from "@/modules/shared/action-utils";
import { ValidateError } from "@/lib/errors";
import { logActivity } from "@/modules/activity/activity-service";
import { ACTIVITY_ACTIONS } from "@/modules/activity/activity-constants";
import {
  ActionInputToggleDeckFavorite,
  ActionInputCheckDeckFavorite,
  ActionInputCheckDeckFavorites,
  ActionOutputToggleDeckFavorite,
  ActionOutputCheckDeckFavorite,
  ActionOutputCheckDeckFavorites,
  ActionOutputGetUserFavoriteDecks,
  validateActionInputToggleDeckFavorite,
  validateActionInputCheckDeckFavorite,
  validateActionInputCheckDeckFavorites,
} from "./deck-action-dto";
import {
  serviceToggleDeckFavorite,
  serviceCheckDeckFavorite,
  serviceCheckDeckFavorites,
  serviceGetUserFavoriteDecks,
} from "./deck-service";

const log = createLogger("deck-action");

function mapVisibility(v: string): "PRIVATE" | "PUBLIC" {
  return v as "PRIVATE" | "PUBLIC";
}

export async function actionToggleDeckFavorite(
  input: ActionInputToggleDeckFavorite
): Promise<ActionOutputToggleDeckFavorite> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, message: "Unauthorized" };
    }

    const validatedInput = validateActionInputToggleDeckFavorite(input);
    const result = await serviceToggleDeckFavorite({
      deckId: validatedInput.deckId,
      userId,
    });

    if (result.success) {
      await logActivity({
        userId,
        action: ACTIVITY_ACTIONS.DECK.FAVORITE_TOGGLE,
        entityType: "deck",
        entityId: validatedInput.deckId,
      });
    }

    return result;
  } catch (e) {
    if (e instanceof ValidateError) {
      return { success: false, message: e.message };
    }
    log.error("Failed to toggle deck favorite", { error: e });
    return { success: false, message: "Unknown error occurred" };
  }
}

export async function actionCheckDeckFavorite(
  input: ActionInputCheckDeckFavorite
): Promise<ActionOutputCheckDeckFavorite> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        success: true,
        message: "Not logged in",
        data: { isFavorited: false, favoriteCount: 0 },
      };
    }

    const validatedInput = validateActionInputCheckDeckFavorite(input);
    const result = await serviceCheckDeckFavorite({
      deckId: validatedInput.deckId,
      userId,
    });

    return result;
  } catch (e) {
    if (e instanceof ValidateError) {
      return { success: false, message: e.message };
    }
    log.error("Failed to check deck favorite", { error: e });
    return { success: false, message: "Unknown error occurred" };
  }
}

export async function actionCheckDeckFavorites(
  input: ActionInputCheckDeckFavorites
): Promise<ActionOutputCheckDeckFavorites> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        success: true,
        message: "Not logged in",
        data: {},
      };
    }

    const validatedInput = validateActionInputCheckDeckFavorites(input);
    const result = await serviceCheckDeckFavorites({
      deckIds: validatedInput.deckIds,
      userId,
    });

    return result;
  } catch (e) {
    if (e instanceof ValidateError) {
      return { success: false, message: e.message };
    }
    log.error("Failed to check deck favorites batch", { error: e });
    return { success: false, message: "Unknown error occurred" };
  }
}

export async function actionGetUserFavoriteDecks(): Promise<ActionOutputGetUserFavoriteDecks> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, message: "Unauthorized" };
    }

    const result = await serviceGetUserFavoriteDecks(userId);

    if (!result.success || !result.data) {
      return { success: false, message: result.message };
    }

    return {
      success: true,
      message: result.message,
      data: result.data.map((deck) => ({
        ...deck,
        visibility: mapVisibility(deck.visibility),
      })),
    };
  } catch (e) {
    log.error("Failed to get user favorite decks", { error: e });
    return { success: false, message: "Unknown error occurred" };
  }
}
