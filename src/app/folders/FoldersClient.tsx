"use client";

import {
  ChevronRight,
  Folder as Fd,
  FolderPen,
  FolderPlus,
  Globe,
  Heart,
  Lock,
  Search,
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
  actionSearchPublicFolders,
  actionSetFolderVisibility,
  actionToggleFavorite,
  actionCheckFavorite,
} from "@/modules/folder/folder-aciton";
import { TPublicFolder, TSharedFolderWithTotalPairs } from "@/shared/folder-type";

type TabType = "my" | "public";

interface FolderProps {
  folder: TSharedFolderWithTotalPairs;
  refresh: () => void;
  showVisibility?: boolean;
}

const FolderCard = ({ folder, refresh, showVisibility = true }: FolderProps) => {
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
            {showVisibility && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                {folder.visibility === "PUBLIC" ? (
                  <Globe size={12} />
                ) : (
                  <Lock size={12} />
                )}
                {folder.visibility === "PUBLIC" ? t("public") : t("private")}
              </span>
            )}
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
        {showVisibility && (
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
        )}
        <CircleButton
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            const newName = prompt(t("enterNewName"))?.trim();
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

interface PublicFolderCardProps {
  folder: TPublicFolder;
  currentUserId?: string;
  onFavoriteChange?: () => void;
}

const PublicFolderCard = ({ folder, currentUserId, onFavoriteChange }: PublicFolderCardProps) => {
  const router = useRouter();
  const t = useTranslations("folders");
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(folder.favoriteCount);

  useEffect(() => {
    if (currentUserId) {
      actionCheckFavorite(folder.id).then(result => {
        if (result.success && result.data) {
          setIsFavorited(result.data.isFavorited);
          setFavoriteCount(result.data.favoriteCount);
        }
      });
    }
  }, [folder.id, currentUserId]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUserId) {
      toast.error(t("pleaseLogin"));
      return;
    }
    const result = await actionToggleFavorite(folder.id);
    if (result.success && result.data) {
      setIsFavorited(result.data.isFavorited);
      setFavoriteCount(result.data.favoriteCount);
      onFavoriteChange?.();
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
          <h3 className="font-semibold text-gray-900 truncate">{folder.name}</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {t("publicFolderInfo", {
              userName: folder.userName ?? folder.userUsername ?? t("unknownUser"),
              totalPairs: folder.totalPairs,
            })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-sm text-gray-400">
          <Heart
            size={14}
            className={isFavorited ? "fill-red-500 text-red-500" : ""}
          />
          <span>{favoriteCount}</span>
        </div>
        <CircleButton
          onClick={handleToggleFavorite}
          title={isFavorited ? t("unfavorite") : t("favorite")}
        >
          <Heart
            size={18}
            className={isFavorited ? "fill-red-500 text-red-500" : ""}
          />
        </CircleButton>
        <ChevronRight size={20} className="text-gray-400" />
      </div>
    </div>
  );
};

interface FoldersClientProps {
  userId: string | null;
  initialPublicFolders: TPublicFolder[];
}

export function FoldersClient({ userId, initialPublicFolders }: FoldersClientProps) {
  const t = useTranslations("folders");
  const [folders, setFolders] = useState<TSharedFolderWithTotalPairs[]>([]);
  const [publicFolders, setPublicFolders] = useState<TPublicFolder[]>(initialPublicFolders);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>(userId ? "my" : "public");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (userId) {
      setLoading(true);
      actionGetFoldersWithTotalPairsByUserId(userId)
        .then((result) => {
          if (result.success && result.data) {
            setFolders(result.data);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [userId]);

  const updateFolders = async () => {
    if (!userId) return;
    setLoading(true);
    const result = await actionGetFoldersWithTotalPairsByUserId(userId);
    if (result.success && result.data) {
      setFolders(result.data);
    }
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setPublicFolders(initialPublicFolders);
      return;
    }
    setLoading(true);
    const result = await actionSearchPublicFolders(searchQuery.trim());
    if (result.success && result.data) {
      setPublicFolders(result.data);
    }
    setLoading(false);
  };

  const handleCreateFolder = async () => {
    if (!userId) return;
    const folderName = prompt(t("enterFolderName"));
    if (!folderName) return;
    setLoading(true);
    try {
      const result = await actionCreateFolder(userId, folderName);
      if (result.success) {
        updateFolders();
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

      <div className="flex items-center gap-2 mb-4">
        {userId && (
          <button
            onClick={() => setActiveTab("my")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "my"
                ? "bg-primary-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {t("myFolders")}
          </button>
        )}
        <button
          onClick={() => setActiveTab("public")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "public"
              ? "bg-primary-500 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {t("publicFolders")}
        </button>
      </div>

      {activeTab === "public" && (
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder={t("searchPlaceholder")}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <CircleButton onClick={handleSearch}>
            <Search size={18} />
          </CircleButton>
        </div>
      )}

      {activeTab === "my" && userId && (
        <LightButton
          onClick={handleCreateFolder}
          disabled={loading}
          className="w-full border-dashed"
        >
          <FolderPlus size={20} />
          <span>{loading ? t("creating") : t("newFolder")}</span>
        </LightButton>
      )}

      <div className="mt-4">
        <CardList>
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm text-gray-500">{t("loading")}</p>
            </div>
          ) : activeTab === "my" && userId ? (
            folders.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                  <FolderPlus size={24} className="text-gray-400" />
                </div>
                <p className="text-sm">{t("noFoldersYet")}</p>
              </div>
            ) : (
              folders
                .toSorted((a, b) => a.id - b.id)
                .map((folder) => (
                  <FolderCard
                    key={folder.id}
                    folder={folder}
                    refresh={updateFolders}
                    showVisibility={true}
                  />
                ))
            )
          ) : (
            publicFolders.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                  <Fd size={24} className="text-gray-400" />
                </div>
                <p className="text-sm">{t("noPublicFolders")}</p>
              </div>
            ) : (
              publicFolders.map((folder) => (
                <PublicFolderCard
                  key={folder.id}
                  folder={folder}
                  currentUserId={userId ?? undefined}
                  onFavoriteChange={handleSearch}
                />
              ))
            )
          )}
        </CardList>
      </div>
    </PageLayout>
  );
}
