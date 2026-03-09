"use client";

import {
  Folder as Fd,
  Heart,
  Search,
  ArrowUpDown,
} from "lucide-react";
import { CircleButton } from "@/design-system/base/button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { PageLayout } from "@/components/ui/PageLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  actionSearchPublicFolders,
  actionToggleFavorite,
  actionCheckFavorite,
} from "@/modules/folder/folder-action";
import { TPublicFolder } from "@/shared/folder-type";
import { authClient } from "@/lib/auth-client";

interface PublicFolderCardProps {
  folder: TPublicFolder;
  currentUserId?: string;
  onUpdateFavorite: (folderId: number, isFavorited: boolean, favoriteCount: number) => void;
}

const PublicFolderCard = ({ folder, currentUserId, onUpdateFavorite }: PublicFolderCardProps) => {
  const router = useRouter();
  const t = useTranslations("explore");
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(folder.favoriteCount);

  useEffect(() => {
    if (currentUserId) {
      actionCheckFavorite(folder.id).then((result) => {
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
      onUpdateFavorite(folder.id, result.data.isFavorited, result.data.favoriteCount);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div
      className="group bg-white border border-gray-200 sm:border-2 rounded-lg p-3 sm:p-5 hover:border-primary-300 hover:shadow-md cursor-pointer transition-all overflow-hidden"
      onClick={() => {
        router.push(`/explore/${folder.id}`);
      }}
    >
      <div className="flex items-start justify-between mb-2 sm:mb-3">
        <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-500">
          <Fd size={18} className="sm:hidden" />
          <Fd size={22} className="hidden sm:block" />
        </div>
        <CircleButton
          onClick={handleToggleFavorite}
          title={isFavorited ? t("unfavorite") : t("favorite")}
        >
          <Heart
            size={16}
            className={`sm:w-[18px] sm:h-[18px] sm:text-[18px] ${isFavorited ? "fill-red-500 text-red-500" : ""}`}
          />
        </CircleButton>
      </div>

      <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base mb-1 sm:mb-2">{folder.name}</h3>
      
      <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3 line-clamp-2">
        {t("folderInfo", {
          userName: folder.userName ?? folder.userUsername ?? t("unknownUser"),
          totalPairs: folder.totalPairs,
        })}
      </p>

      <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-400">
        <Heart size={12} className="sm:w-3.5 sm:h-3.5" />
        <span>{favoriteCount}</span>
      </div>
    </div>
  );
};

interface ExploreClientProps {
  initialPublicFolders: TPublicFolder[];
}

export function ExploreClient({ initialPublicFolders }: ExploreClientProps) {
  const t = useTranslations("explore");
  const router = useRouter();
  const [publicFolders, setPublicFolders] = useState<TPublicFolder[]>(initialPublicFolders);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortByFavorites, setSortByFavorites] = useState(false);

  const { data: session } = authClient.useSession();
  const currentUserId = session?.user?.id;

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

  const handleToggleSort = () => {
    setSortByFavorites((prev) => !prev);
  };

  const sortedFolders = sortByFavorites
    ? [...publicFolders].sort((a, b) => b.favoriteCount - a.favoriteCount)
    : publicFolders;

  const handleUpdateFavorite = (folderId: number, _isFavorited: boolean, favoriteCount: number) => {
    setPublicFolders((prev) =>
      prev.map((f) =>
        f.id === folderId ? { ...f, favoriteCount } : f
      )
    );
  };

  return (
    <PageLayout>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="flex items-center gap-2 mb-6">
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
        <CircleButton
          onClick={handleToggleSort}
          title={sortByFavorites ? t("sortByFavoritesActive") : t("sortByFavorites")}
          className={sortByFavorites ? "bg-primary-100 text-primary-600 hover:bg-primary-200" : ""}
        >
          <ArrowUpDown size={18} />
        </CircleButton>
        <CircleButton onClick={handleSearch}>
          <Search size={18} />
        </CircleButton>
      </div>

      {loading ? (
        <div className="p-8 text-center">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-500">{t("loading")}</p>
        </div>
      ) : sortedFolders.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
            <Fd size={24} className="text-gray-400" />
          </div>
          <p className="text-sm">{t("noFolders")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedFolders.map((folder) => (
            <PublicFolderCard
              key={folder.id}
              folder={folder}
              currentUserId={currentUserId}
              onUpdateFavorite={handleUpdateFavorite}
            />
          ))}
        </div>
      )}
    </PageLayout>
  );
}
