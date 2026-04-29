import type { Metadata } from "next";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { WordEntryClient } from "./WordEntryClient";
import { actionGetDecksByUserId } from "@/modules/deck/deck-action";
import type { ActionOutputDeck } from "@/modules/deck/deck-action-dto";

export const metadata: Metadata = {
  title: "Word Entry | Learn Languages",
  description: "Quickly add words to your decks by pasting.",
};

export default async function WordEntryPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect("/login?redirect=/word-entry");
  }

  let decks: ActionOutputDeck[] = [];
  const result = await actionGetDecksByUserId({ userId: session.user.id });
  if (result.success && result.data) {
    decks = result.data;
  }

  return <WordEntryClient userId={session.user.id} initialDecks={decks} />;
}
