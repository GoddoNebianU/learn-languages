"use server";

import { createLogger } from "@/lib/logger";
import {
  ServiceInputCreateDeck,
  ServiceInputUpdateDeck,
  ServiceInputDeleteDeck,
  ServiceInputGetDeckById,
  ServiceInputGetDecksByUserId,
  ServiceInputGetPublicDecks,
  ServiceInputCheckOwnership,
  ServiceOutputDeck,
  ServiceOutputPublicDeck,
  ServiceInputToggleDeckFavorite,
  ServiceInputCheckDeckFavorite,
  ServiceInputSearchPublicDecks,
  ServiceInputGetPublicDeckById,
  ServiceOutputDeckFavorite,
  ServiceOutputUserFavoriteDeck,
} from "./deck-service-dto";
import {
  repoCreateDeck,
  repoUpdateDeck,
  repoGetDeckById,
  repoGetDecksByUserId,
  repoGetPublicDecks,
  repoDeleteDeck,
  repoGetUserIdByDeckId,
  repoToggleDeckFavorite,
  repoCheckDeckFavorite,
  repoSearchPublicDecks,
  repoGetPublicDeckById,
  repoGetUserFavoriteDecks,
} from "./deck-repository";

const log = createLogger("deck-service");

export async function serviceCheckOwnership(input: ServiceInputCheckOwnership): Promise<boolean> {
  const ownerId = await repoGetUserIdByDeckId(input.deckId);
  return ownerId === input.userId;
}

export async function serviceCreateDeck(input: ServiceInputCreateDeck): Promise<{ success: boolean; deckId?: number; message: string }> {
  try {
    log.info("Creating deck", { name: input.name, userId: input.userId });
    const deckId = await repoCreateDeck(input);
    log.info("Deck created successfully", { deckId });
    return { success: true, deckId, message: "Deck created successfully" };
  } catch (error) {
    log.error("Failed to create deck", { error });
    return { success: false, message: "Failed to create deck" };
  }
}

export async function serviceUpdateDeck(input: ServiceInputUpdateDeck): Promise<{ success: boolean; message: string }> {
  try {
    log.info("Updating deck", { deckId: input.deckId });
    await repoUpdateDeck({
      id: input.deckId,
      name: input.name,
      desc: input.desc,
      visibility: input.visibility,
      collapsed: input.collapsed,
    });
    log.info("Deck updated successfully", { deckId: input.deckId });
    return { success: true, message: "Deck updated successfully" };
  } catch (error) {
    log.error("Failed to update deck", { error, deckId: input.deckId });
    return { success: false, message: "Failed to update deck" };
  }
}

export async function serviceDeleteDeck(input: ServiceInputDeleteDeck): Promise<{ success: boolean; message: string }> {
  try {
    log.info("Deleting deck", { deckId: input.deckId });
    await repoDeleteDeck({ id: input.deckId });
    log.info("Deck deleted successfully", { deckId: input.deckId });
    return { success: true, message: "Deck deleted successfully" };
  } catch (error) {
    log.error("Failed to delete deck", { error, deckId: input.deckId });
    return { success: false, message: "Failed to delete deck" };
  }
}

export async function serviceGetDeckById(input: ServiceInputGetDeckById): Promise<{ success: boolean; data?: ServiceOutputDeck; message: string }> {
  try {
    const deck = await repoGetDeckById({ id: input.deckId });
    if (!deck) {
      return { success: false, message: "Deck not found" };
    }
    return { success: true, data: deck, message: "Deck retrieved successfully" };
  } catch (error) {
    log.error("Failed to get deck", { error, deckId: input.deckId });
    return { success: false, message: "Failed to get deck" };
  }
}

export async function serviceGetDecksByUserId(input: ServiceInputGetDecksByUserId): Promise<{ success: boolean; data?: ServiceOutputDeck[]; message: string }> {
  try {
    const decks = await repoGetDecksByUserId(input);
    return { success: true, data: decks, message: "Decks retrieved successfully" };
  } catch (error) {
    log.error("Failed to get decks", { error, userId: input.userId });
    return { success: false, message: "Failed to get decks" };
  }
}

export async function serviceGetPublicDecks(input: ServiceInputGetPublicDecks = {}): Promise<{ success: boolean; data?: ServiceOutputPublicDeck[]; message: string }> {
  try {
    const decks = await repoGetPublicDecks(input);
    return { success: true, data: decks, message: "Public decks retrieved successfully" };
  } catch (error) {
    log.error("Failed to get public decks", { error });
    return { success: false, message: "Failed to get public decks" };
  }
}

export async function serviceGetPublicDeckById(input: ServiceInputGetPublicDeckById): Promise<{ success: boolean; data?: ServiceOutputPublicDeck; message: string }> {
  try {
    const deck = await repoGetPublicDeckById(input);
    if (!deck) {
      return { success: false, message: "Deck not found or not public" };
    }
    return { success: true, data: deck, message: "Deck retrieved successfully" };
  } catch (error) {
    log.error("Failed to get public deck", { error, deckId: input.deckId });
    return { success: false, message: "Failed to get deck" };
  }
}

export async function serviceToggleDeckFavorite(input: ServiceInputToggleDeckFavorite): Promise<{ success: boolean; data?: ServiceOutputDeckFavorite; message: string }> {
  try {
    const result = await repoToggleDeckFavorite(input);
    return { success: true, data: result, message: "Favorite toggled successfully" };
  } catch (error) {
    log.error("Failed to toggle deck favorite", { error, deckId: input.deckId });
    return { success: false, message: "Failed to toggle favorite" };
  }
}

export async function serviceCheckDeckFavorite(input: ServiceInputCheckDeckFavorite): Promise<{ success: boolean; data?: ServiceOutputDeckFavorite; message: string }> {
  try {
    const result = await repoCheckDeckFavorite(input);
    return { success: true, data: result, message: "Favorite status retrieved" };
  } catch (error) {
    log.error("Failed to check deck favorite", { error, deckId: input.deckId });
    return { success: false, message: "Failed to check favorite status" };
  }
}

export async function serviceSearchPublicDecks(input: ServiceInputSearchPublicDecks): Promise<{ success: boolean; data?: ServiceOutputPublicDeck[]; message: string }> {
  try {
    const decks = await repoSearchPublicDecks(input);
    return { success: true, data: decks, message: "Search completed successfully" };
  } catch (error) {
    log.error("Failed to search public decks", { error, query: input.query });
    return { success: false, message: "Search failed" };
  }
}

export async function serviceGetUserFavoriteDecks(userId: string): Promise<{ success: boolean; data?: ServiceOutputUserFavoriteDeck[]; message: string }> {
  try {
    const favorites = await repoGetUserFavoriteDecks({ userId });
    return { success: true, data: favorites, message: "Favorite decks retrieved successfully" };
  } catch (error) {
    log.error("Failed to get user favorite decks", { error, userId });
    return { success: false, message: "Failed to get favorite decks" };
  }
}
