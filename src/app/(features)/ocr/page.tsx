import { OCRClient } from "./OCRClient";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { actionGetDecksByUserId } from "@/modules/deck/deck-action";
import type { ActionOutputDeck } from "@/modules/deck/deck-action-dto";

export default async function OCRPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  
  let decks: ActionOutputDeck[] = [];
  
  if (session?.user?.id) {
    const result = await actionGetDecksByUserId(session.user.id as string);
    if (result.success && result.data) {
      decks = result.data;
    }
  }

  return <OCRClient initialDecks={decks} />;
}
