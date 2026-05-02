import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { actionGetDeckById } from "@/modules/deck/deck-action";
import { Memorize } from "./Memorize";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ deck_id?: string }>;
}): Promise<Metadata> {
  const { deck_id } = await searchParams;
  const deckInfo = deck_id
    ? (await actionGetDeckById({ deckId: Number(deck_id) })).data
    : undefined;
  return {
    title: deckInfo ? `Study: ${deckInfo.name} | Learn Languages` : "Study Mode | Learn Languages",
    description: "Study and memorize flashcards in this deck.",
  };
}

export default async function MemorizePage({
  searchParams,
}: {
  searchParams: Promise<{ deck_id?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  const { deck_id } = await searchParams;

  if (!deck_id) {
    redirect("/decks");
  }

  const deckId = Number(deck_id);

  if (!deckId) {
    redirect("/decks");
  }

  const deckInfo = (await actionGetDeckById({ deckId })).data;

  if (!deckInfo) {
    redirect("/decks");
  }

  const isOwner = session?.user?.id === deckInfo.userId;
  const isPublic = deckInfo.visibility === "PUBLIC";

  if (!isOwner && !isPublic) {
    redirect("/decks");
  }

  return <Memorize deckId={deckId} deckName={deckInfo.name} />;
}
