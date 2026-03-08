import { auth } from "@/auth";
import { FoldersClient } from "./FoldersClient";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function FoldersPage() {
  const session = await auth.api.getSession(
    { headers: await headers() }
  );

  if (!session) {
    redirect("/login?redirect=/folders");
  }

  return <FoldersClient userId={session.user.id} />;
}
