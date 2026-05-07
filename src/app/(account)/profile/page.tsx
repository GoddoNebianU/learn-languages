import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isSingleUserMode } from "@/lib/auth-mode";
import { auth } from "@/auth";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "My Profile | Learn Languages",
  description: "View and manage your profile settings.",
};

export default async function ProfilePage() {
  if (isSingleUserMode()) {
    redirect("/settings");
  }

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    redirect("/login?redirect=/profile");
  }

  redirect(session.user.username ? `/users/${session.user.username}` : "/decks");
}
