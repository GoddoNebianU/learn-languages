import { DictionaryClient } from "./DictionaryClient";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { actionGetFoldersByUserId } from "@/modules/folder/folder-action";
import { TSharedFolder } from "@/shared/folder-type";

export default async function DictionaryPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  
  let folders: TSharedFolder[] = [];
  
  if (session?.user?.id) {
    const result = await actionGetFoldersByUserId(session.user.id as string);
    if (result.success && result.data) {
      folders = result.data;
    }
  }

  return <DictionaryClient initialFolders={folders} />;
}
