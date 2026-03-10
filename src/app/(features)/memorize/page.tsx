import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { isNonNegativeInteger } from "@/utils/random";
import { DeckSelector } from "./DeckSelector";
import { Memorize } from "./Memorize";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { actionGetDecksByUserId } from "@/modules/deck/deck-action";
import { actionGetCardStats } from "@/modules/card/card-action";

export default async function MemorizePage({
  searchParams,
}: {
  searchParams: Promise<{ deck_id?: string; }>;
}) {
  const deckIdParam = (await searchParams).deck_id;

  const t = await getTranslations("memorize.page");

  const deckId = deckIdParam
    ? isNonNegativeInteger(deckIdParam)
      ? parseInt(deckIdParam)
      : null
    : null;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login?redirect=/memorize");

  if (!deckId) {
    const decksResult = await actionGetDecksByUserId(session.user.id);
    const decks = decksResult.data ?? [];
    
    const deckStats = new Map<number, Awaited<ReturnType<typeof actionGetCardStats>>["data"]>();
    for (const deck of decks) {
      const statsResult = await actionGetCardStats({ deckId: deck.id });
      if (statsResult.success && statsResult.data) {
        deckStats.set(deck.id, statsResult.data);
      }
    }

    return (
      <DeckSelector
        decks={decks}
        deckStats={deckStats}
      />
    );
  }

  const decksResult = await actionGetDecksByUserId(session.user.id);
  const deck = decksResult.data?.find(d => d.id === deckId);
  
  if (!deck) {
    redirect("/memorize");
  }

  return <Memorize deckId={deckId} deckName={deck.name} />;
}
