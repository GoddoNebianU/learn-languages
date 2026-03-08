"use client";

import {
  ChevronRight,
  Folder as Fd,
  Heart,
  Search,
} from "lucide-react";
import { CircleButton } from "@/design-system/base/button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { PageLayout } from "@/components/ui/PageLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { CardList } from "@/components/ui/CardList";
import {
  actionSearchPublicFolders,
  actionToggleFavorite,
  actionCheckFavorite,
} from "@/modules/folder/folder-aciton";
import { TPublicFolder } from "@/shared/folder-type";
import { authClient } from "@/lib/auth-client";

interface PublicFolderCardProps {
  folder: TPublicFolder;
  currentUserId?: string;
  onFavoriteChange?: () => void;
}

const PublicFolderCard = ({ folder, currentUserId, onFavoriteChange }: PublicFolderCardProps) => {
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
      onFavoriteChange?.();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div
      className="flex justify-between items-center group py-4 px-5 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={() => {
        router.push(`/explore/${folder.id}`);
      }}
    >
      <div className="flex items-center gap-4 flex-1">
        <div className="shrink-0 text-primary-500">
          <Fd size={24} />
        </div>

        <div className="flex items-center gap-1 text-sm text-gray-400">
          <Heart
            size={14}
            className={isFavorited ? "fill-red-500 text-red-500" : ""}
          />
          <span>{favoriteCount}</span>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{folder.name}</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {t("folderInfo", {
              userName: folder.userName ?? folder.userUsername ?? t("unknownUser"),
              totalPairs: folder.totalPairs,
            })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
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

interface ExploreClientProps {
  initialPublicFolders: TPublicFolder[];
}

export function ExploreClient({ initialPublicFolders }: ExploreClientProps) {
  const t = useTranslations("explore");
  const router = useRouter();
  const [publicFolders, setPublicFolders] = useState<TPublicFolder[]>(initialPublicFolders);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  const refreshFolders = async () => {
    setLoading(true);
    const result = await actionSearchPublicFolders(searchQuery.trim() || "");
    if (result.success && result.data) {
      setPublicFolders(result.data);
    }
    setLoading(false);
  };

  return (
    <PageLayout>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

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

      <div className="mt-4">
        <CardList>
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm text-gray-500">{t("loading")}</p>
            </div>
          ) : publicFolders.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                <Fd size={24} className="text-gray-400" />
              </div>
              <p className="text-sm">{t("noFolders")}</p>
            </div>
          ) : (
            publicFolders.map((folder) => (
              <PublicFolderCard
                key={folder.id}
                folder={folder}
                currentUserId={currentUserId}
                onFavoriteChange={refreshFolders}
              />
            ))
          )}
        </CardList>
      </div>
    </PageLayout>
  );
}
