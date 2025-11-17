import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { getTranslations } from "next-intl/server";
import InFolder from "./InFolder";
import { getOwnerByFolderId } from "@/lib/actions/services/folderService";
export default async function FoldersPage({
  params,
}: {
  params: Promise<{ folder_id: number }>;
}) {
  const session = await getServerSession();
  const { folder_id } = await params;
  const id = Number(folder_id);
  const t = await getTranslations("folder_id");

  if (!id) {
    redirect("/folders");
  }
  if (!session?.user?.name) redirect(`/login?redirect=/folders/${id}`);
  if ((await getOwnerByFolderId(id)) !== session.user.name) {
    return <p>{t("unauthorized")}</p>;
  }
  return <InFolder folderId={id} />;
}
