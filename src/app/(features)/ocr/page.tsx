import { OCRClient } from "./OCRClient";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { actionGetFoldersByUserId } from "@/modules/folder/folder-action";
import { TSharedFolder } from "@/shared/folder-type";

export default async function OCRPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  
  let folders: TSharedFolder[] = [];
  
  if (session?.user?.id) {
    const result = await actionGetFoldersByUserId(session.user.id as string);
    if (result.success && result.data) {
      folders = result.data;
    }
  }

  return <OCRClient initialFolders={folders} />;
}
