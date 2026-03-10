import { redirect } from "next/navigation";
import { ExploreDetailClient } from "./ExploreDetailClient";
import { actionGetPublicDeckById } from "@/modules/deck/deck-action";

export default async function ExploreDeckPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id) {
    redirect("/explore");
  }

  const result = await actionGetPublicDeckById({ deckId: Number(id) });

  if (!result.success || !result.data) {
    redirect("/explore");
  }

  return <ExploreDetailClient deck={result.data} />;
}
