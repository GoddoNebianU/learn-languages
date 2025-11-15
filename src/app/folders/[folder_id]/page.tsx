import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import InFolder from "./InFolder";
import { getOwnerByFolderId } from "@/lib/services/folderService";
export default async function FoldersPage({
  params,
}: {
  params: Promise<{ folder_id: number }>;
}) {
  const session = await getServerSession();
  const { folder_id } = await params;
  const id = Number(folder_id);
  if (!id) {
    redirect("/folders");
  }
  if (!session?.user?.name) redirect(`/login?redirect=/folders/${id}`);
  if ((await getOwnerByFolderId(id)) !== session.user.name) {
    return "you are not the owner of this folder";
  }
  return <InFolder folderId={id} />;
}
