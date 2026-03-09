import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { isNonNegativeInteger } from "@/utils/random";
import { FolderSelector } from "./FolderSelector";
import { Memorize } from "./Memorize";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { actionGetFoldersWithTotalPairsByUserId, actionGetPairsByFolderId } from "@/modules/folder/folder-action";

export default async function MemorizePage({
  searchParams,
}: {
  searchParams: Promise<{ folder_id?: string; }>;
}) {
  const tParam = (await searchParams).folder_id;

  const t = await getTranslations("memorize.page");

  const folder_id = tParam
    ? isNonNegativeInteger(tParam)
      ? parseInt(tParam)
      : null
    : null;

  if (!folder_id) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/login?redirect=/memorize");

    return (
      <FolderSelector
        folders={(await actionGetFoldersWithTotalPairsByUserId(session.user.id)).data!}
      />
    );
  }

  return <Memorize textPairs={(await actionGetPairsByFolderId(folder_id)).data!} />;
}
