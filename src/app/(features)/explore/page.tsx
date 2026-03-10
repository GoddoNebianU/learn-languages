import { ExploreClient } from "./ExploreClient";
import { actionGetPublicDecks } from "@/modules/deck/deck-action";

export default async function ExplorePage() {
  const publicDecksResult = await actionGetPublicDecks();
  const publicDecks = publicDecksResult.success ? publicDecksResult.data ?? [] : [];

  return <ExploreClient initialPublicDecks={publicDecks} />;
}
