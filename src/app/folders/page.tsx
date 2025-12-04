import { auth } from "@/auth";
import FoldersClient from "./FoldersClient";
import { redirect } from "next/navigation";
export default async function FoldersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect(`/login?redirect=/folders`);
  return <FoldersClient userId={Number(session.user.id)} />;
}
