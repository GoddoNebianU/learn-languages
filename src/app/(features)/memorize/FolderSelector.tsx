"use client";

import Container from "@/components/ui/Container";
import { useRouter } from "next/navigation";
import { Center } from "@/components/common/Center";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Folder } from "../../../../generated/prisma/browser";
import { Folder as Fd } from "lucide-react";

interface FolderSelectorProps {
  folders: (Folder & { total: number })[];
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
            <Link className="text-blue-900 border-b" href={"/folders"}>
              folders
            </Link>
          </h1>
        )) || (
          <>
            <h1 className="text-2xl text-gray-900 font-light">
              {t("selectFolder")}
            </h1>
            <div className="text-gray-900 border border-gray-200 rounded-2xl max-h-96 overflow-y-auto">
              {folders
                .toSorted((a, b) => a.id - b.id)
                .map((folder) => (
                  <div
                    key={folder.id}
                    onClick={() =>
                      router.push(`/memorize?folder_id=${folder.id}`)
                    }
                    className="flex flex-row justify-center items-center group p-2 gap-2 hover:cursor-pointer hover:bg-gray-50"
                  >
                    <Fd />
                    <div className="flex-1 flex gap-2">
                      <span className="group-hover:text-blue-500">
                        {t("folderInfo", {
                          id: folder.id,
                          name: folder.name,
                          count: folder.total,
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
