import FoldersClient from "./FoldersClient";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
export default async function FoldersPage() {
  const session = await getServerSession();
  if (!session?.user?.name) redirect(`/login`);
  return (
    <FoldersClient username={session.user.name} />
  );
}
