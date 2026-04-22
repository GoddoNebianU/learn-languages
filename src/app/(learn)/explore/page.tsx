import type { Metadata } from "next";
import { ExploreClient } from "./ExploreClient";
import { actionGetPublicDecks } from "@/modules/deck/deck-action";

export const metadata: Metadata = {
  title: "Explore Decks | Learn Languages",
  description: "Browse and discover public flashcard decks shared by the community.",
};

export default async function ExplorePage() {
  const publicDecksResult = await actionGetPublicDecks();
  const publicDecks = publicDecksResult.success ? publicDecksResult.data ?? [] : [];

  return <ExploreClient initialPublicDecks={publicDecks} />;
}
