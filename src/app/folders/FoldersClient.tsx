"use client";

import {
  ChevronRight,
  Folder as Fd,
  FolderPen,
  FolderPlus,
  Globe,
  Lock,
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
import {
  actionCreateFolder,
  actionDeleteFolderById,
  actionGetFoldersWithTotalPairsByUserId,
  actionRenameFolderById,
  actionSetFolderVisibility,
} from "@/modules/folder/folder-aciton";
import { TSharedFolderWithTotalPairs } from "@/shared/folder-type";

interface FolderCardProps {
  folder: TSharedFolderWithTotalPairs;
  refresh: () => void;
}

const FolderCard = ({ folder, refresh }: FolderCardProps) => {
  const router = useRouter();
  const t = useTranslations("folders");

  const handleToggleVisibility = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newVisibility = folder.visibility === "PUBLIC" ? "PRIVATE" : "PUBLIC";
    const result = await actionSetFolderVisibility(folder.id, newVisibility);
    if (result.success) {
      refresh();
    } else {
      toast.error(result.message);
    }
  };

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
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 truncate">{folder.name}</h3>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              {folder.visibility === "PUBLIC" ? (
                <Globe size={12} />
              ) : (
                <Lock size={12} />
              )}
              {folder.visibility === "PUBLIC" ? t("public") : t("private")}
            </span>
          </div>
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
          onClick={handleToggleVisibility}
          title={folder.visibility === "PUBLIC" ? t("setPrivate") : t("setPublic")}
        >
          {folder.visibility === "PUBLIC" ? (
            <Lock size={18} />
          ) : (
            <Globe size={18} />
          )}
        </CircleButton>
        <CircleButton
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            const newName = prompt(t("enterNewName"))?.trim();
            if (newName && newName.length > 0) {
              actionRenameFolderById(folder.id, newName).then((result) => {
                if (result.success) {
                  refresh();
                } else {
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
              actionDeleteFolderById(folder.id).then((result) => {
                if (result.success) {
                  refresh();
                } else {
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

interface FoldersClientProps {
  userId: string;
}

export function FoldersClient({ userId }: FoldersClientProps) {
  const t = useTranslations("folders");
  const router = useRouter();
  const [folders, setFolders] = useState<TSharedFolderWithTotalPairs[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFolders();
  }, [userId]);

  const loadFolders = async () => {
    setLoading(true);
    const result = await actionGetFoldersWithTotalPairsByUserId(userId);
    if (result.success && result.data) {
      setFolders(result.data);
    }
    setLoading(false);
  };

  const handleCreateFolder = async () => {
    const folderName = prompt(t("enterFolderName"));
    if (!folderName) return;
    setLoading(true);
    try {
      const result = await actionCreateFolder(userId, folderName);
      if (result.success) {
        loadFolders();
      } else {
        toast.error(result.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <LightButton
        onClick={handleCreateFolder}
        disabled={loading}
        className="w-full border-dashed mb-4"
      >
        <FolderPlus size={20} />
        <span>{loading ? t("creating") : t("newFolder")}</span>
      </LightButton>

      <CardList>
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-gray-500">{t("loading")}</p>
          </div>
        ) : folders.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
              <FolderPlus size={24} className="text-gray-400" />
            </div>
            <p className="text-sm">{t("noFoldersYet")}</p>
          </div>
        ) : (
          folders
            .toSorted((a, b) => b.id - a.id)
            .map((folder) => (
              <FolderCard key={folder.id} folder={folder} refresh={loadFolders} />
            ))
        )}
      </CardList>
    </PageLayout>
  );
}
