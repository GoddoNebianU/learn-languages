import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import InFolder from "./InFolder";
import { getUserIdByFolderId } from "@/lib/server/services/folderService";
import { auth } from "@/auth";
import { headers } from "next/headers";
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
  if (!session) redirect(`/login?redirect=/folders/${folder_id}`);
  if ((await getUserIdByFolderId(Number(folder_id))) !== session.user.id) {
    return <p>{t("unauthorized")}</p>;
  }
  return <InFolder folderId={Number(folder_id)} />;
}
