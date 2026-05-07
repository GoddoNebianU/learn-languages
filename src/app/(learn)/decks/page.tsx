import type { Metadata } from "next";
import { getCurrentUserId } from "@/modules/shared/action-utils";
import { DecksClient } from "./DecksClient";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "My Decks | Learn Languages",
  description: "Manage your flashcard decks and study sets.",
};

export default async function DecksPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login?redirect=/decks");

  return <DecksClient userId={userId} />;
}
