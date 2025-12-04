"use server";

import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  getFoldersWithTotalPairsByUserId,
  getUserIdByFolderId,
} from "@/lib/actions/services/folderService";
import { isNonNegativeInteger } from "@/lib/utils";
import FolderSelector from "./FolderSelector";
import Memorize from "./Memorize";
import { getPairsByFolderId } from "@/lib/actions/services/pairService";
import { auth } from "@/auth";

export default async function MemorizePage({
  searchParams,
}: {
  searchParams: Promise<{ folder_id?: string }>;
}) {
  const session = await auth();
  const userId = session?.user?.id;
  const t = await getTranslations("memorize.page");

  const tParam = (await searchParams).folder_id;
  const folder_id = tParam
    ? isNonNegativeInteger(tParam)
      ? parseInt(tParam)
      : null
    : null;

  if (!userId) {
    redirect(
      `/login?redirect=/memorize${folder_id ? `?folder_id=${folder_id}` : ""}`,
    );
  }

  const uid = Number(userId);

  if (!folder_id) {
    return (
      <FolderSelector
        folders={await getFoldersWithTotalPairsByUserId(uid)}
      />
    );
  }

  const owner = await getUserIdByFolderId(folder_id);
  if (owner !== uid) {
    return <p>{t("unauthorized")}</p>;
  }

  return <Memorize textPairs={await getPairsByFolderId(folder_id)} />;
}
