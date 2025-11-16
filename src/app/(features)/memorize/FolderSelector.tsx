"use client";

import Container from "@/components/cards/Container";
import { folder } from "../../../../generated/prisma/client";
import { Folder } from "lucide-react";
import { useRouter } from "next/navigation";
import { Center } from "@/components/Center";
import { useTranslations } from "next-intl";

interface FolderSelectorProps {
  folders: (folder & { total_pairs: number })[];
}

const FolderSelector: React.FC<FolderSelectorProps> = ({ folders }) => {
  const t = useTranslations("memorize.folder_selector");
  const router = useRouter();
  return (
    <Center>
      <Container className="p-6 gap-4 flex flex-col">
        {(folders.length === 0 && (
          <h1 className="text-2xl text-gray-900 font-light">
            {t("noFolders")}
          </h1>
        )) || (
          <>
            <h1 className="text-2xl text-gray-900 font-light">
              {t("selectFolder")}
            </h1>
            <div className="text-gray-900 border border-gray-200 rounded-2xl max-h-96 overflow-y-auto">
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  onClick={() =>
                    router.push(`/memorize?folder_id=${folder.id}`)
                  }
                  className="flex flex-row justify-center items-center group p-2 gap-2 hover:cursor-pointer hover:bg-gray-50"
                >
                  <Folder />
                  <div className="flex-1 flex gap-2">
                    <span className="group-hover:text-blue-500">
                      {t("folderInfo", {
                        id: folder.id,
                        name: folder.name,
                        count: folder.total_pairs,
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Container>
    </Center>
  );
};

export default FolderSelector;
