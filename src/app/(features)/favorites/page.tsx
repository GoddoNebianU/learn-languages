import { auth } from "@/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { FavoritesClient } from "./FavoritesClient";

export default async function FavoritesPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login?redirect=/favorites");
  }

  return <FavoritesClient userId={session.user.id} />;
}
