"use server";

import { auth } from "@/auth";
import { headers } from "next/headers";
import { createLogger } from "@/lib/logger";
import { ValidateError } from "@/lib/errors";
import { Visibility } from "../../../generated/prisma/enums";
import {
  ActionInputCreateDeck,
  ActionInputUpdateDeck,
  ActionInputDeleteDeck,
  ActionInputGetDeckById,
  ActionInputGetPublicDecks,
  ActionInputSearchPublicDecks,
  ActionInputGetPublicDeckById,
  ActionInputToggleDeckFavorite,
  ActionInputCheckDeckFavorite,
  ActionOutputCreateDeck,
  ActionOutputUpdateDeck,
  ActionOutputDeleteDeck,
  ActionOutputGetDeckById,
  ActionOutputGetDecksByUserId,
  ActionOutputGetPublicDecks,
  ActionOutputDeck,
  ActionOutputPublicDeck,
  ActionOutputSearchPublicDecks,
  ActionOutputGetPublicDeckById,
  ActionOutputToggleDeckFavorite,
  ActionOutputCheckDeckFavorite,
  ActionOutputGetUserFavoriteDecks,
  validateActionInputCreateDeck,
  validateActionInputUpdateDeck,
  validateActionInputDeleteDeck,
  validateActionInputGetDeckById,
  validateActionInputGetPublicDecks,
  validateActionInputSearchPublicDecks,
  validateActionInputGetPublicDeckById,
  validateActionInputToggleDeckFavorite,
  validateActionInputCheckDeckFavorite,
} from "./deck-action-dto";
import {
  serviceCreateDeck,
  serviceUpdateDeck,
  serviceDeleteDeck,
  serviceGetDeckById,
  serviceGetDecksByUserId,
  serviceGetPublicDecks,
  serviceCheckOwnership,
  serviceSearchPublicDecks,
  serviceGetPublicDeckById,
  serviceToggleDeckFavorite,
  serviceCheckDeckFavorite,
  serviceGetUserFavoriteDecks,
} from "./deck-service";

const log = createLogger("deck-action");

async function checkDeckOwnership(deckId: number): Promise<boolean> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return false;
  return serviceCheckOwnership({ deckId, userId: session.user.id });
}

export async function actionCreateDeck(input: ActionInputCreateDeck): Promise<ActionOutputCreateDeck> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const validatedInput = validateActionInputCreateDeck(input);
    const result = await serviceCreateDeck({
      name: validatedInput.name,
      desc: validatedInput.desc,
      userId: session.user.id,
      visibility: validatedInput.visibility as Visibility | undefined,
    });

    return result;
  } catch (e) {
    if (e instanceof ValidateError) {
      return { success: false, message: e.message };
    }
    log.error("Failed to create deck", { error: e });
    return { success: false, message: "Unknown error occurred" };
  }
}

export async function actionUpdateDeck(input: ActionInputUpdateDeck): Promise<ActionOutputUpdateDeck> {
  try {
    const validatedInput = validateActionInputUpdateDeck(input);
    
    const isOwner = await checkDeckOwnership(validatedInput.deckId);
    if (!isOwner) {
      return { success: false, message: "You do not have permission to update this deck" };
    }

    return serviceUpdateDeck({
      deckId: validatedInput.deckId,
      name: validatedInput.name,
      desc: validatedInput.desc,
      visibility: validatedInput.visibility as Visibility | undefined,
    });
  } catch (e) {
    if (e instanceof ValidateError) {
      return { success: false, message: e.message };
    }
    log.error("Failed to update deck", { error: e });
    return { success: false, message: "Unknown error occurred" };
  }
}

export async function actionDeleteDeck(input: ActionInputDeleteDeck): Promise<ActionOutputDeleteDeck> {
  try {
    const validatedInput = validateActionInputDeleteDeck(input);
    
    const isOwner = await checkDeckOwnership(validatedInput.deckId);
    if (!isOwner) {
      return { success: false, message: "You do not have permission to delete this deck" };
    }

    return serviceDeleteDeck({ deckId: validatedInput.deckId });
  } catch (e) {
    if (e instanceof ValidateError) {
      return { success: false, message: e.message };
    }
    log.error("Failed to delete deck", { error: e });
    return { success: false, message: "Unknown error occurred" };
  }
}

export async function actionGetDeckById(input: ActionInputGetDeckById): Promise<ActionOutputGetDeckById> {
  try {
    const validatedInput = validateActionInputGetDeckById(input);
    const result = await serviceGetDeckById({ deckId: validatedInput.deckId });
    
    if (!result.success || !result.data) {
      return { success: false, message: result.message };
    }

    return {
      success: true,
      message: result.message,
      data: {
        ...result.data,
        visibility: result.data.visibility as "PRIVATE" | "PUBLIC",
      },
    };
  } catch (e) {
    log.error("Failed to get deck", { error: e });
    return { success: false, message: "Unknown error occurred" };
  }
}

export async function actionGetDecksByUserId(userId: string): Promise<ActionOutputGetDecksByUserId> {
  try {
    const result = await serviceGetDecksByUserId({ userId });
    
    if (!result.success || !result.data) {
      return { success: false, message: result.message };
    }

    return {
      success: true,
      message: result.message,
      data: result.data.map((deck) => ({
        ...deck,
        visibility: deck.visibility as "PRIVATE" | "PUBLIC",
      })),
    };
  } catch (e) {
    log.error("Failed to get decks", { error: e });
    return { success: false, message: "Unknown error occurred" };
  }
}

export async function actionGetPublicDecks(input: ActionInputGetPublicDecks = {}): Promise<ActionOutputGetPublicDecks> {
  try {
    const validatedInput = validateActionInputGetPublicDecks(input);
    const result = await serviceGetPublicDecks(validatedInput);
    
    if (!result.success || !result.data) {
      return { success: false, message: result.message };
    }

    return {
      success: true,
      message: result.message,
      data: result.data.map((deck) => ({
        ...deck,
        visibility: deck.visibility as "PRIVATE" | "PUBLIC",
      })),
    };
  } catch (e) {
    if (e instanceof ValidateError) {
      return { success: false, message: e.message };
    }
    log.error("Failed to get public decks", { error: e });
    return { success: false, message: "Unknown error occurred" };
  }
}

export async function actionGetPublicDeckById(input: ActionInputGetPublicDeckById): Promise<ActionOutputGetPublicDeckById> {
  try {
    const validatedInput = validateActionInputGetPublicDeckById(input);
    const result = await serviceGetPublicDeckById(validatedInput);
    
    if (!result.success || !result.data) {
      return { success: false, message: result.message };
    }

    return {
      success: true,
      message: result.message,
      data: {
        ...result.data,
        visibility: result.data.visibility as "PRIVATE" | "PUBLIC",
      },
    };
  } catch (e) {
    if (e instanceof ValidateError) {
      return { success: false, message: e.message };
    }
    log.error("Failed to get public deck", { error: e });
    return { success: false, message: "Unknown error occurred" };
  }
}

export async function actionSearchPublicDecks(input: ActionInputSearchPublicDecks): Promise<ActionOutputSearchPublicDecks> {
  try {
    const validatedInput = validateActionInputSearchPublicDecks(input);
    const result = await serviceSearchPublicDecks(validatedInput);
    
    if (!result.success || !result.data) {
      return { success: false, message: result.message };
    }

    return {
      success: true,
      message: result.message,
      data: result.data.map((deck) => ({
        ...deck,
        visibility: deck.visibility as "PRIVATE" | "PUBLIC",
      })),
    };
  } catch (e) {
    if (e instanceof ValidateError) {
      return { success: false, message: e.message };
    }
    log.error("Failed to search public decks", { error: e });
    return { success: false, message: "Unknown error occurred" };
  }
}

export async function actionToggleDeckFavorite(input: ActionInputToggleDeckFavorite): Promise<ActionOutputToggleDeckFavorite> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const validatedInput = validateActionInputToggleDeckFavorite(input);
    const result = await serviceToggleDeckFavorite({
      deckId: validatedInput.deckId,
      userId: session.user.id,
    });

    return result;
  } catch (e) {
    if (e instanceof ValidateError) {
      return { success: false, message: e.message };
    }
    log.error("Failed to toggle deck favorite", { error: e });
    return { success: false, message: "Unknown error occurred" };
  }
}

export async function actionCheckDeckFavorite(input: ActionInputCheckDeckFavorite): Promise<ActionOutputCheckDeckFavorite> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { success: true, message: "Not logged in", data: { isFavorited: false, favoriteCount: 0 } };
    }

    const validatedInput = validateActionInputCheckDeckFavorite(input);
    const result = await serviceCheckDeckFavorite({
      deckId: validatedInput.deckId,
      userId: session.user.id,
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

export async function actionGetUserFavoriteDecks(): Promise<ActionOutputGetUserFavoriteDecks> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const result = await serviceGetUserFavoriteDecks(session.user.id);

    if (!result.success || !result.data) {
      return { success: false, message: result.message };
    }

    return {
      success: true,
      message: result.message,
      data: result.data.map((deck) => ({
        ...deck,
        visibility: deck.visibility as "PRIVATE" | "PUBLIC",
      })),
    };
  } catch (e) {
    log.error("Failed to get user favorite decks", { error: e });
    return { success: false, message: "Unknown error occurred" };
  }
}
