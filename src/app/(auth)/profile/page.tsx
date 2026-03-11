import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect("/login?redirect=/profile");
  }
  
  redirect(session.user.username ? `/users/${session.user.username}` : "/decks");
}
