"use server";

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { getTranslations } from "next-intl/server";
import {
  getFoldersWithTotalPairsByOwner,
  getOwnerByFolderId,
} from "@/lib/actions/services/folderService";
import { isNonNegativeInteger } from "@/lib/utils";
import FolderSelector from "./FolderSelector";
import Memorize from "./Memorize";
import { getTextPairsByFolderId } from "@/lib/actions/services/textPairService";

export default async function MemorizePage({
  searchParams,
}: {
  searchParams: Promise<{ folder_id?: string }>;
}) {
  const session = await getServerSession();
  const username = session?.user?.name;
  const t = await getTranslations("memorize.page");

  const tParam = (await searchParams).folder_id;
  const folder_id = tParam
    ? isNonNegativeInteger(tParam)
      ? parseInt(tParam)
      : null
    : null;

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
    return <p>{t("unauthorized")}</p>;
  }

  return <Memorize textPairs={await getTextPairsByFolderId(folder_id)} />;
}
