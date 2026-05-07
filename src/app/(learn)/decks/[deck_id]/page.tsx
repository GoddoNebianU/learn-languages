import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { InDeck } from "./InDeck";
import { getCurrentUserId } from "@/modules/shared/action-utils";
import { actionGetDeckById } from "@/modules/deck/deck-action";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ deck_id: string }>;
}): Promise<Metadata> {
  const { deck_id } = await params;
  const deckInfo = (await actionGetDeckById({ deckId: Number(deck_id) })).data;
  return {
    title: deckInfo ? `${deckInfo.name} | Learn Languages` : "Deck | Learn Languages",
    description: "View and study flashcards in this deck.",
  };
}

export default async function DecksPage({ params }: { params: Promise<{ deck_id: number }> }) {
  const userId = await getCurrentUserId();
  const { deck_id } = await params;
  const t = await getTranslations("deck_id");

  if (!deck_id) {
    redirect("/decks");
  }

  const deckInfo = (await actionGetDeckById({ deckId: Number(deck_id) })).data;

  if (!deckInfo) {
    redirect("/decks");
  }

  const isOwner = userId === deckInfo.userId;
  const isPublic = deckInfo.visibility === "PUBLIC";

  if (!isOwner && !isPublic) {
    redirect("/decks");
  }

  const isReadOnly = !isOwner;

  return <InDeck deckId={Number(deck_id)} isReadOnly={isReadOnly} />;
}
