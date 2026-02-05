import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { InFolder } from "./InFolder";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { actionGetUserIdByFolderId } from "@/modules/folder/folder-aciton";

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

  // Allow non-authenticated users to view folders (read-only mode)
  const folderUserId = (await actionGetUserIdByFolderId(Number(folder_id))).data;
  const isOwner = session?.user?.id === folderUserId;
  const isReadOnly = !isOwner;

  return <InFolder folderId={Number(folder_id)} isReadOnly={isReadOnly} />;
}
