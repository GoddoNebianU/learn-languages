import { DictionaryClient } from "./DictionaryClient";
import { getCurrentUserId } from "@/modules/shared/action-utils";
import { actionGetMyDecks } from "@/modules/deck/deck-action";
import type { ActionOutputDeck } from "@/modules/deck/deck-action-dto";

export default async function DictionaryPage() {
  const userId = await getCurrentUserId();

  let decks: ActionOutputDeck[] = [];

  if (userId) {
    const result = await actionGetMyDecks();
    if (result.success && result.data) {
      decks = result.data;
    }
  }

  return <DictionaryClient initialDecks={decks} />;
}
