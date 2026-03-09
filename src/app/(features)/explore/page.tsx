import { ExploreClient } from "./ExploreClient";
import { actionGetPublicFolders } from "@/modules/folder/folder-action";

export default async function ExplorePage() {
  const publicFoldersResult = await actionGetPublicFolders();
  const publicFolders = publicFoldersResult.success ? publicFoldersResult.data ?? [] : [];

  return <ExploreClient initialPublicFolders={publicFolders} />;
}
