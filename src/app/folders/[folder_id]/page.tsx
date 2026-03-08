import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { InFolder } from "./InFolder";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { actionGetFolderVisibility } from "@/modules/folder/folder-aciton";

export default async function FoldersPage({
  params,
}: {
  params: Promise<{ folder_id: number; }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  const { folder_id } = await params;
  const t = await getTranslations("folder_id");

  if (!folder_id) {
    redirect("/folders");
  }

  const folderInfo = (await actionGetFolderVisibility(Number(folder_id))).data;

  if (!folderInfo) {
    redirect("/folders");
  }

  const isOwner = session?.user?.id === folderInfo.userId;
  const isPublic = folderInfo.visibility === "PUBLIC";

  if (!isOwner && !isPublic) {
    redirect("/folders");
  }

  const isReadOnly = !isOwner;

  return <InFolder folderId={Number(folder_id)} isReadOnly={isReadOnly} />;
}
