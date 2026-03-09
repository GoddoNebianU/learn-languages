import { redirect } from "next/navigation";
import { ExploreDetailClient } from "./ExploreDetailClient";
import { actionGetPublicFolderById } from "@/modules/folder/folder-action";

export default async function ExploreFolderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id) {
    redirect("/explore");
  }

  const result = await actionGetPublicFolderById(Number(id));

  if (!result.success || !result.data) {
    redirect("/explore");
  }

  return <ExploreDetailClient folder={result.data} />;
}
