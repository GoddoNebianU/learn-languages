import type { Metadata } from "next";
import { auth } from "@/auth";
import { DecksClient } from "./DecksClient";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "My Decks | Learn Languages",
  description: "Manage your flashcard decks and study sets.",
};

export default async function DecksPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login?redirect=/decks");
  }

  return <DecksClient userId={session.user.id} />;
}
