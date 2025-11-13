import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import InFolder from "./InFolder";
import { getOwnerByFolderId } from "@/lib/controllers/FolderController";
export default async function FoldersPage({
  params,
}: {
  params: Promise<{ folder_id: number }>;
}) {
  const session = await getServerSession();
  const { folder_id } = await params;
  if (!session?.user?.name) redirect(`/login`);
  if ((await getOwnerByFolderId(folder_id)) !== session.user.name) {
    return "you are not the owner of this folder";
  }
  return <InFolder folderId={folder_id} />;
}
