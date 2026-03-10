import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { InDeck } from "./InDeck";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { actionGetDeckById } from "@/modules/deck/deck-action";

export default async function DecksPage({
  params,
}: {
  params: Promise<{ deck_id: number; }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  const { deck_id } = await params;
  const t = await getTranslations("deck_id");

  if (!deck_id) {
    redirect("/decks");
  }

  const deckInfo = (await actionGetDeckById({ deckId: Number(deck_id) })).data;

  if (!deckInfo) {
    redirect("/decks");
  }

  const isOwner = session?.user?.id === deckInfo.userId;
  const isPublic = deckInfo.visibility === "PUBLIC";

  if (!isOwner && !isPublic) {
    redirect("/decks");
  }

  const isReadOnly = !isOwner;

  return <InDeck deckId={Number(deck_id)} isReadOnly={isReadOnly} />;
}
