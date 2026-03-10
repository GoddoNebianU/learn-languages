import { auth } from "@/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { FavoritesClient } from "./FavoritesClient";
import { actionGetUserFavoriteDecks } from "@/modules/deck/deck-action";
import type { ActionOutputUserFavoriteDeck } from "@/modules/deck/deck-action-dto";

export default async function FavoritesPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login?redirect=/favorites");
  }

  let favorites: ActionOutputUserFavoriteDeck[] = [];
  const result = await actionGetUserFavoriteDecks();
  if (result.success && result.data) {
    favorites = result.data;
  }

  return <FavoritesClient initialFavorites={favorites} />;
}
