import { redirect } from "next/navigation";
import { InFolder } from "@/app/folders/[folder_id]/InFolder";
import { actionGetFolderVisibility } from "@/modules/folder/folder-aciton";

export default async function ExploreFolderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id) {
    redirect("/explore");
  }

  const folderInfo = (await actionGetFolderVisibility(Number(id))).data;

  if (!folderInfo) {
    redirect("/explore");
  }

  const isPublic = folderInfo.visibility === "PUBLIC";

  if (!isPublic) {
    redirect("/explore");
  }

  return <InFolder folderId={Number(id)} isReadOnly={true} />;
}
