"use client";

import { LightButton } from "@/components/ui/buttons";
import Container from "@/components/ui/Container";
import { TranslationHistorySchema } from "@/lib/interfaces";
import { Dispatch, useEffect, useState } from "react";
import z from "zod";
import { Folder } from "../../../../generated/prisma/browser";
import { getFoldersByUserId } from "@/lib/server/services/folderService";
import { Folder as Fd } from "lucide-react";
import { createPair } from "@/lib/server/services/pairService";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { authClient } from "@/lib/auth-client";

interface AddToFolderProps {
  item: z.infer<typeof TranslationHistorySchema>;
  setShow: Dispatch<React.SetStateAction<boolean>>;
}

const AddToFolder: React.FC<AddToFolderProps> = ({ item, setShow }) => {
  const { data: session } = authClient.useSession();
  const [folders, setFolders] = useState<Folder[]>([]);
  const t = useTranslations("translator.add_to_folder");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    const userId = session.user.id;
    getFoldersByUserId(userId)
      .then(setFolders)
      .then(() => setLoading(false));
  }, [session]);


  if (!session) {
    return (
      <div className="fixed left-0 top-0 z-50 w-screen h-screen bg-black/50 flex justify-center items-center">
        <Container className="p-6">
          <div>{t("notAuthenticated")}</div>
        </Container>
      </div>
    );
  }
  return (
    <div className="fixed left-0 top-0 z-50 w-screen h-screen bg-black/50 flex justify-center items-center">
      <Container className="p-6">
        <h1>{t("chooseFolder")}</h1>
        <div className="border border-gray-200 rounded-2xl">
          {(loading && <span>...</span>) ||
            (folders.length > 0 &&
              folders.map((folder) => (
                <button
                  key={folder.id}
                  className="p-2 flex items-center justify-start hover:bg-gray-50 gap-2 hover:cursor-pointer w-full border-b border-gray-200"
                  onClick={() => {
                    createPair({
                      text1: item.text1,
                      text2: item.text2,
                      locale1: item.locale1,
                      locale2: item.locale2,
                      folder: {
                        connect: {
                          id: folder.id,
                        },
                      },
                    })
                      .then(() => {
                        toast.success(t("success"));
                        setShow(false);
                      })
                      .catch(() => {
                        toast.error(t("error"));
                      });
                  }}
                >
                  <Fd />
                  {t("folderInfo", { id: folder.id, name: folder.name })}
                </button>
              ))) || <div>{t("noFolders")}</div>}
        </div>
        <LightButton onClick={() => setShow(false)}>{t("close")}</LightButton>
      </Container>
    </div>
  );
};

export default AddToFolder;
