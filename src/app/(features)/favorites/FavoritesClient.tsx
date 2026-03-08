"use client";

import {
  ChevronRight,
  Folder as Fd,
  Heart,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { PageLayout } from "@/components/ui/PageLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { CardList } from "@/components/ui/CardList";
import { actionGetUserFavorites } from "@/modules/folder/folder-aciton";

type UserFavorite = {
  id: number;
  folderId: number;
  folderName: string;
  folderCreatedAt: Date;
  folderTotalPairs: number;
  folderOwnerId: string;
  folderOwnerName: string | null;
  folderOwnerUsername: string | null;
  favoritedAt: Date;
};

interface FavoriteCardProps {
  favorite: UserFavorite;
}

const FavoriteCard = ({ favorite }: FavoriteCardProps) => {
  const router = useRouter();
  const t = useTranslations("favorites");

  return (
    <div
      className="flex justify-between items-center group py-4 px-5 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={() => {
        router.push(`/explore/${favorite.folderId}`);
      }}
    >
      <div className="flex items-center gap-4 flex-1">
        <div className="shrink-0 text-primary-500">
          <Fd size={24} />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{favorite.folderName}</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {t("folderInfo", {
              userName: favorite.folderOwnerName ?? favorite.folderOwnerUsername ?? t("unknownUser"),
              totalPairs: favorite.folderTotalPairs,
            })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Heart size={18} className="fill-red-500 text-red-500" />
        <ChevronRight size={20} className="text-gray-400" />
      </div>
    </div>
  );
};

interface FavoritesClientProps {
  userId: string;
}

export function FavoritesClient({ userId }: FavoritesClientProps) {
  const t = useTranslations("favorites");
  const [favorites, setFavorites] = useState<UserFavorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, [userId]);

  const loadFavorites = async () => {
    setLoading(true);
    const result = await actionGetUserFavorites();
    if (result.success && result.data) {
      setFavorites(result.data);
    }
    setLoading(false);
  };

  return (
    <PageLayout>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="mt-4">
        <CardList>
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm text-gray-500">{t("loading")}</p>
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                <Heart size={24} className="text-gray-400" />
              </div>
              <p className="text-sm">{t("noFavorites")}</p>
            </div>
          ) : (
            favorites.map((favorite) => (
              <FavoriteCard key={favorite.id} favorite={favorite} />
            ))
          )}
        </CardList>
      </div>
    </PageLayout>
  );
}
