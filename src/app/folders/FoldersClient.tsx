"use client";

import { ChevronRight, Folder, FolderPlus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Center } from "@/components/Center";
import { useRouter } from "next/navigation";
import { folder } from "../../../generated/prisma/browser";
import {
  createFolder,
  deleteFolderById,
  getFoldersWithTotalPairsByOwner,
} from "@/lib/services/folderService";
import { useTranslations } from "next-intl";

interface FolderProps {
  folder: folder & { total_pairs: number };
  deleteCallback: () => void;
  openCallback: () => void;
}

const FolderCard = ({ folder, deleteCallback, openCallback }: FolderProps) => {
  const t = useTranslations("folders");
  return (
    <div
      className="flex justify-between items-center group p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={openCallback}
    >
      <div className="flex items-center gap-3 flex-1">
        <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-50 to-blue-100 flex items-center justify-center group-hover:from-blue-100 group-hover:to-blue-200 transition-colors">
          <Folder></Folder>
        </div>

        <div className="flex-1">
          <h3 className="font-medium text-gray-900">
            {t("folderInfo", {
              id: folder.id,
              name: folder.name,
              totalPairs: folder.total_pairs,
            })}
          </h3>
          {/*<p className="text-sm text-gray-500">{} items</p>*/}
        </div>

        <div className="text-xs text-gray-400">#{folder.id}</div>
      </div>

      <div className="flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteCallback();
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

export default function FoldersClient({ username }: { username: string }) {
  const t = useTranslations("folders");
  const [folders, setFolders] = useState<(folder & { total_pairs: number })[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    getFoldersWithTotalPairsByOwner(username).then((folders) => {
      setFolders(folders);
    });
  }, [username]);

  const updateFolders = async () => {
    setLoading(true);
    try {
      const updatedFolders = await getFoldersWithTotalPairsByOwner(username);
      setFolders(updatedFolders);
    } finally {
      setLoading(false);
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
                owner: username,
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
              {folders.map((folder) => (
                <FolderCard
                  key={folder.id}
                  folder={folder}
                  deleteCallback={() => {
                    const confirm = prompt(
                      t("confirmDelete", { name: folder.name }),
                    );
                    if (confirm === folder.name) {
                      deleteFolderById(folder.id).then(updateFolders);
                    }
                  }}
                  openCallback={() => {
                    router.push(`/folders/${folder.id}`);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Center>
  );
}
