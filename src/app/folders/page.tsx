import { auth } from "@/auth";
import FoldersClient from "./FoldersClient";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function FoldersPage() {
  const session = await auth.api.getSession(
    { headers: await headers() }
  );
  if (!session) redirect(`/signin?redirect=/folders`);
  return <FoldersClient userId={session.user.id} />;
}
