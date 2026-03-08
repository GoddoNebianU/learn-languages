import { auth } from "@/auth";
import { FoldersClient } from "./FoldersClient";
import { headers } from "next/headers";
import { actionGetPublicFolders } from "@/modules/folder/folder-aciton";

export default async function FoldersPage() {
  const session = await auth.api.getSession(
    { headers: await headers() }
  );

  const publicFoldersResult = await actionGetPublicFolders();
  const publicFolders = publicFoldersResult.success ? publicFoldersResult.data ?? [] : [];

  if (!session) {
    return (
      <FoldersClient
        userId={null}
        initialPublicFolders={publicFolders}
      />
    );
  }

  return (
    <FoldersClient
      userId={session.user.id}
      initialPublicFolders={publicFolders}
    />
  );
}
