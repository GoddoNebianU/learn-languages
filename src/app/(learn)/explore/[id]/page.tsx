import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ExploreDetailClient } from "./ExploreDetailClient";
import { actionGetPublicDeckById } from "@/modules/deck/deck-action";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const result = await actionGetPublicDeckById({ deckId: Number(id) });
  return {
    title: result.success && result.data ? `${result.data.name} | Learn Languages` : "Deck Details | Learn Languages",
    description: "View deck details, cards, and study materials.",
  };
}

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
