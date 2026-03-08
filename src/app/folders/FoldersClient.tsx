"use client";

import {
  ChevronRight,
  Folder as Fd,
  FolderPen,
  FolderPlus,
  Trash2,
} from "lucide-react";
import { CircleButton, LightButton } from "@/design-system/base/button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { PageLayout } from "@/components/ui/PageLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { CardList } from "@/components/ui/CardList";
import { actionCreateFolder, actionDeleteFolderById, actionGetFoldersWithTotalPairsByUserId, actionRenameFolderById } from "@/modules/folder/folder-aciton";
import { TSharedFolderWithTotalPairs } from "@/shared/folder-type";

interface FolderProps {
  folder: TSharedFolderWithTotalPairs;
  refresh: () => void;
}

const FolderCard = ({ folder, refresh }: FolderProps) => {
  const router = useRouter();
  const t = useTranslations("folders");

  return (
    <div
      className="flex justify-between items-center group py-4 px-5 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={() => {
        router.push(`/folders/${folder.id}`);
      }}
    >
      <div className="flex items-center gap-4 flex-1">
        <div className="shrink-0 text-primary-500">
          <Fd size={24} />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{folder.name}</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {t("folderInfo", {
              id: folder.id,
              name: folder.name,
              totalPairs: folder.total,
            })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 ml-4">
        <CircleButton
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            const newName = prompt("Input a new name.")?.trim();
            if (newName && newName.length > 0) {
              actionRenameFolderById(folder.id, newName)
                .then(result => {
                  if (result.success) {
                    refresh();
                  }
                  else {
                    toast.error(result.message);
                  }
                });
            }
          }}
        >
          <FolderPen size={18} />
        </CircleButton>
        <CircleButton
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            const confirm = prompt(t("confirmDelete", { name: folder.name }));
            if (confirm === folder.name) {
              actionDeleteFolderById(folder.id)
                .then(result => {
                  if (result.success) {
                    refresh();
                  }
                  else {
                    toast.error(result.message);
                  }
                });
            }
          }}
          className="text-gray-400 hover:text-red-500 hover:bg-red-50"
        >
          <Trash2 size={18} />
        </CircleButton>
        <ChevronRight size={20} className="text-gray-400 ml-1" />
      </div>
    </div>
  );
};

export function FoldersClient({ userId }: { userId: string; }) {
  const t = useTranslations("folders");
  const [folders, setFolders] = useState<TSharedFolderWithTotalPairs[]>(
    [],
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    actionGetFoldersWithTotalPairsByUserId(userId)
      .then((folders) => {
        if (folders.success && folders.data) {
          setFolders(folders.data);
          setLoading(false);
        }
      });
  }, [userId]);

  const updateFolders = async () => {
    setLoading(true);
    await actionGetFoldersWithTotalPairsByUserId(userId)
      .then(async result => {
        if (!result.success) toast.error(result.message);
        else await actionGetFoldersWithTotalPairsByUserId(userId)
          .then((folders) => {
            if (folders.success && folders.data) {
              setFolders(folders.data);
            }
          });
      });
    setLoading(false);
  };

  return (
    <PageLayout>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      {/* 新建文件夹按钮 */}
      <LightButton
        onClick={async () => {
          const folderName = prompt(t("enterFolderName"));
          if (!folderName) return;
          setLoading(true);
          try {
            await actionCreateFolder(userId, folderName)
              .then(result => {
                if (result.success) {
                  updateFolders();
                } else {
                  toast.error(result.message);
                }
              });
          } finally {
            setLoading(false);
          }
        }}
        disabled={loading}
        className="w-full border-dashed"
      >
        <FolderPlus size={20} />
        <span>{loading ? t("creating") : t("newFolder")}</span>
      </LightButton>

      {/* 文件夹列表 */}
      <div className="mt-4">
        <CardList>
          {folders.length === 0 ? (
            // 空状态
            <div className="text-center py-12 text-gray-400">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                <FolderPlus size={24} className="text-gray-400" />
              </div>
              <p className="text-sm">{t("noFoldersYet")}</p>
            </div>
          ) : (
            // 文件夹卡片列表
            folders
              .toSorted((a, b) => a.id - b.id)
              .map((folder) => (
                <FolderCard
                  key={folder.id}
                  folder={folder}
                  refresh={updateFolders}
                />
              ))
          )}
        </CardList>
      </div>
    </PageLayout>
  );
}
