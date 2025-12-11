"use client";

import {
  ChevronRight,
  Folder as Fd,
  FolderPen,
  FolderPlus,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Center } from "@/components/common/Center";
import { useRouter } from "next/navigation";
import { Folder } from "../../../generated/prisma/browser";
import {
  createFolder,
  deleteFolderById,
  getFoldersWithTotalPairsByUserId,
  renameFolderById,
} from "@/lib/server/services/folderService";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

interface FolderProps {
  folder: Folder & { total: number };
  refresh: () => void;
}

const FolderCard = ({ folder, refresh }: FolderProps) => {
  const router = useRouter();

  const t = useTranslations("folders");
  return (
    <div
      className="flex justify-between items-center group p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={() => {
        router.push(`/folders/${folder.id}`);
      }}
    >
      <div className="flex items-center gap-3 flex-1">
        <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-50 to-blue-100 flex items-center justify-center group-hover:from-blue-100 group-hover:to-blue-200 transition-colors">
          <Fd></Fd>
        </div>

        <div className="flex-1">
          <h3 className="font-medium text-gray-900">
            {t("folderInfo", {
              id: folder.id,
              name: folder.name,
              totalPairs: folder.total,
            })}
          </h3>
        </div>

        <div className="text-xs text-gray-400">#{folder.id}</div>
      </div>

      <div className="flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            const newName = prompt("Input a new name.")?.trim();
            if (newName && newName.length > 0) {
              renameFolderById(folder.id, newName).then(refresh);
            }
          }}
          className="p-2 text-gray-400 hover:bg-red-50 rounded-lg transition-colors"
        >
          <FolderPen size={16} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            const confirm = prompt(t("confirmDelete", { name: folder.name }));
            if (confirm === folder.name) {
              deleteFolderById(folder.id).then(refresh);
            }
          }}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 size={16} />
        </button>
        <ChevronRight size={18} className="text-gray-400" />
      </div>
    </div>
  );
};

export default function FoldersClient({ userId }: { userId: string }) {
  const t = useTranslations("folders");
  const [folders, setFolders] = useState<(Folder & { total: number })[]>(
    [],
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getFoldersWithTotalPairsByUserId(userId)
      .then((folders) => {
        setFolders(folders);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        toast.error("加载出错，请重试。");
      });
  }, [userId]);

  const updateFolders = async () => {
    try {
      const updatedFolders = await getFoldersWithTotalPairsByUserId(userId);
      setFolders(updatedFolders);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <Center>
      <div className="w-full max-w-2xl mx-auto bg-white border border-gray-200 rounded-2xl p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-light text-gray-900">{t("title")}</h1>
          <p className="text-sm text-gray-500 mt-1">{t("subtitle")}</p>
        </div>

        <button
          onClick={async () => {
            const folderName = prompt(t("enterFolderName"));
            if (!folderName) return;
            setLoading(true);
            try {
              await createFolder({
                name: folderName,
                user: { connect: { id: userId } },
              });
              await updateFolders();
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
          className="w-full p-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-2"
        >
          <FolderPlus size={18} />
          <span>{loading ? t("creating") : t("newFolder")}</span>
        </button>

        <div className="mt-4 max-h-96 overflow-y-auto">
          {folders.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="w-16 h-16 mx-auto mb-3 rounded-lg bg-gray-100 flex items-center justify-center">
                <FolderPlus size={24} className="text-gray-400" />
              </div>
              <p className="text-sm">{t("noFoldersYet")}</p>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 overflow-hidden">
              {folders
                .toSorted((a, b) => a.id - b.id)
                .map((folder) => (
                  <FolderCard
                    key={folder.id}
                    folder={folder}
                    refresh={updateFolders}
                  />
                ))}
            </div>
          )}
        </div>
      </div>
    </Center>
  );
}
