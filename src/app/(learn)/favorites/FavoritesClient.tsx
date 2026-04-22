"use client";

import {
  ChevronRight,
  Layers as DeckIcon,
  Heart,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { PageLayout } from "@/components/ui/PageLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { CardList } from "@/components/ui/CardList";
import { VStack } from "@/design-system/stack";
import { Skeleton } from "@/design-system/skeleton";
import { actionGetUserFavoriteDecks, actionToggleDeckFavorite } from "@/modules/deck/deck-action";
import type { ActionOutputUserFavoriteDeck } from "@/modules/deck/deck-action-dto";

interface FavoriteCardProps {
  favorite: ActionOutputUserFavoriteDeck;
  onRemoveFavorite: (deckId: number) => void;
}

const FavoriteCard = ({ favorite, onRemoveFavorite }: FavoriteCardProps) => {
  const router = useRouter();
  const t = useTranslations("favorites");
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemoveFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isRemoving) return;
    
    setIsRemoving(true);
    const result = await actionToggleDeckFavorite({ deckId: favorite.id });
    if (result.success) {
      onRemoveFavorite(favorite.id);
    } else {
      toast.error(result.message);
    }
    setIsRemoving(false);
  };

  return (
    <div
      className="flex justify-between items-center group py-4 px-5 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={() => {
        router.push(`/explore/${favorite.id}`);
      }}
    >
      <div className="flex items-center gap-4 flex-1">
        <div className="shrink-0 text-primary-500">
          <DeckIcon size={24} />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{favorite.name}</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {t("folderInfo", {
              userName: favorite.userName ?? favorite.userUsername ?? t("unknownUser"),
              totalPairs: favorite.cardCount ?? 0,
            })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Heart
          size={18}
          className="fill-red-500 text-red-500 cursor-pointer hover:scale-110 transition-transform"
          onClick={handleRemoveFavorite}
        />
        <ChevronRight size={20} className="text-gray-400" />
      </div>
    </div>
  );
};

interface FavoritesClientProps {
  initialFavorites: ActionOutputUserFavoriteDeck[];
}

export function FavoritesClient({ initialFavorites }: FavoritesClientProps) {
  const t = useTranslations("favorites");
  const [favorites, setFavorites] = useState<ActionOutputUserFavoriteDeck[]>(initialFavorites);
  const [loading, setLoading] = useState(false);

  const loadFavorites = async () => {
    setLoading(true);
    const result = await actionGetUserFavoriteDecks();
    if (result.success && result.data) {
      setFavorites(result.data);
    }
    setLoading(false);
  };

  const handleRemoveFavorite = (deckId: number) => {
    setFavorites((prev) => prev.filter((f) => f.id !== deckId));
  };

  return (
    <PageLayout>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <CardList>
        {loading ? (
          <VStack align="center" className="p-8">
            <Skeleton variant="circular" className="w-8 h-8" />
            <p className="text-sm text-gray-500">{t("loading")}</p>
          </VStack>
        ) : favorites.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
              <Heart size={24} className="text-gray-400" />
            </div>
            <p className="text-sm">{t("noFavorites")}</p>
          </div>
        ) : (
          favorites.map((favorite) => (
            <FavoriteCard
              key={favorite.id}
              favorite={favorite}
              onRemoveFavorite={handleRemoveFavorite}
            />
          ))
        )}
      </CardList>
    </PageLayout>
  );
}
