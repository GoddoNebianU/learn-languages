import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { actionGetDeckById } from "@/modules/deck/deck-action";
import { Memorize } from "./Memorize";

export default async function LearnPage({
  params,
}: {
  params: Promise<{ deck_id: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  const { deck_id } = await params;
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
