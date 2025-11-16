"use server";

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import {
  getFoldersWithTotalPairsByOwner,
  getOwnerByFolderId,
} from "@/lib/services/folderService";
import { isNonNegativeInteger } from "@/lib/utils";
import FolderSelector from "./FolderSelector";
import Memorize from "./Memorize";
import { getTextPairsByFolderId } from "@/lib/services/textPairService";

export default async function MemorizePage({
  searchParams,
}: {
  searchParams: Promise<{ folder_id?: string }>;
}) {
  const session = await getServerSession();
  const username = session?.user?.name;

  const t = (await searchParams).folder_id;
  const folder_id = t ? (isNonNegativeInteger(t) ? parseInt(t) : null) : null;

  if (!username)
    redirect(
      `/login?redirect=/memorize${folder_id ? `?folder_id=${folder_id}` : ""}`,
    );

  if (!folder_id) {
    return (
      <FolderSelector
        folders={await getFoldersWithTotalPairsByOwner(username)}
      />
    );
  }

  const owner = await getOwnerByFolderId(folder_id);
  if (owner !== username) {
    return <p>无权访问该文件夹</p>;
  }

  return <Memorize textPairs={await getTextPairsByFolderId(folder_id)} />;
}
