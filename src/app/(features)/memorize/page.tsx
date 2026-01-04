import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  getFoldersWithTotalPairsByUserId,
} from "@/lib/server/services/folderService";
import { isNonNegativeInteger } from "@/lib/utils";
import FolderSelector from "./FolderSelector";
import Memorize from "./Memorize";
import { getPairsByFolderId } from "@/lib/server/services/pairService";
import { auth } from "@/auth";
import { headers } from "next/headers";

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
    if(!session) redirect("/auth?redirect=/memorize")
    return (
      <FolderSelector
        folders={await getFoldersWithTotalPairsByUserId(session.user.id)}
      />
    );
  }

  return <Memorize textPairs={await getPairsByFolderId(folder_id)} />;
}
