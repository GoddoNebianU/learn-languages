import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "My Profile | Learn Languages",
  description: "View and manage your profile settings.",
};

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect("/login?redirect=/profile");
  }

  redirect(session.user.username ? `/users/${session.user.username}` : "/decks");
}
