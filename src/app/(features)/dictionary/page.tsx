import { DictionaryClient } from "./DictionaryClient";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { actionGetDecksByUserId } from "@/modules/deck/deck-action";
import type { TSharedDeck } from "@/shared/anki-type";

export default async function DictionaryPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  
  let decks: TSharedDeck[] = [];
  
  if (session?.user?.id) {
    const result = await actionGetDecksByUserId(session.user.id as string);
    if (result.success && result.data) {
      decks = result.data as TSharedDeck[];
    }
  }

  return <DictionaryClient initialDecks={decks} />;
}
