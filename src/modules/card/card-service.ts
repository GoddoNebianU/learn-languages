import type {
  RepoInputCreateCard,
  RepoInputUpdateCard,
  RepoInputDeleteCard,
  RepoInputGetCardsByDeckId,
  RepoInputGetRandomCard,
  RepoOutputCard,
  RepoOutputCardStats,
} from "./card-repository-dto";
import { repoGetUserIdByDeckId } from "@/modules/deck/deck-repository";
import { createLogger } from "@/lib/logger";
import {
  repoCreateCard,
  repoUpdateCard,
  repoDeleteCard,
  repoGetCardById,
  repoGetCardsByDeckId,
  repoGetRandomCard,
  repoGetCardStats,
} from "./card-repository";

const log = createLogger("card-service");

export type ServiceInputCheckDeckOwnership = {
  deckId: number;
  userId: string;
};

export async function serviceCreateCard(
  input: RepoInputCreateCard
): Promise<{ success: boolean; cardId?: number; message: string }> {
  log.info("Creating card", { deckId: input.deckId, word: input.word });
  const cardId = await repoCreateCard(input);
  log.info("Card created", { cardId });
  return { success: true, cardId, message: "Card created successfully" };
}

export async function serviceUpdateCard(
  input: RepoInputUpdateCard
): Promise<{ success: boolean; message: string }> {
  log.info("Updating card", { cardId: input.cardId });
  const card = await repoGetCardById(input.cardId);
  if (!card) {
    return { success: false, message: "Card not found" };
  }
  await repoUpdateCard(input);
  log.info("Card updated", { cardId: input.cardId });
  return { success: true, message: "Card updated successfully" };
}

export async function serviceDeleteCard(
  input: RepoInputDeleteCard
): Promise<{ success: boolean; message: string }> {
  log.info("Deleting card", { cardId: input.cardId });
  const card = await repoGetCardById(input.cardId);
  if (!card) {
    return { success: false, message: "Card not found" };
  }
  await repoDeleteCard(input);
  log.info("Card deleted", { cardId: input.cardId });
  return { success: true, message: "Card deleted successfully" };
}

export async function serviceGetCardById(cardId: number): Promise<RepoOutputCard | null> {
  return repoGetCardById(cardId);
}

export async function serviceGetCardsByDeckId(
  input: RepoInputGetCardsByDeckId
): Promise<RepoOutputCard[]> {
  log.debug("Getting cards by deck", { deckId: input.deckId });
  return repoGetCardsByDeckId(input);
}

export async function serviceGetRandomCard(
  input: RepoInputGetRandomCard
): Promise<RepoOutputCard | null> {
  log.debug("Getting random card", { deckId: input.deckId });
  return repoGetRandomCard(input);
}

export async function serviceGetCardStats(deckId: number): Promise<RepoOutputCardStats> {
  log.debug("Getting card stats", { deckId });
  return repoGetCardStats(deckId);
}

export async function serviceCheckDeckOwnership(
  input: ServiceInputCheckDeckOwnership
): Promise<boolean> {
  log.debug("Checking deck ownership", { deckId: input.deckId });
  const ownerId = await repoGetUserIdByDeckId(input.deckId);
  return ownerId === input.userId;
}
