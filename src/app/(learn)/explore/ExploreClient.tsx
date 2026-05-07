"use client";

import { Layers, Heart, Search, ArrowUpDown } from "lucide-react";
import { IconButton } from "@/design-system/icon-button";
import { Input } from "@/design-system/input";
import { Skeleton } from "@/design-system/skeleton";
import { HStack } from "@/design-system/stack";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { PageLayout } from "@/components/ui/PageLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  actionSearchPublicDecks,
  actionToggleDeckFavorite,
  actionCheckDeckFavorite,
} from "@/modules/deck/deck-action";
import type { ActionOutputPublicDeck } from "@/modules/deck/deck-action-dto";
import { authClient } from "@/lib/auth-client";

interface PublicDeckCardProps {
  deck: ActionOutputPublicDeck;
  currentUserId?: string;
  onUpdateFavorite: (deckId: number, isFavorited: boolean, favoriteCount: number) => void;
}

const PublicDeckCard = ({ deck, currentUserId, onUpdateFavorite }: PublicDeckCardProps) => {
  const router = useRouter();
  const t = useTranslations("explore");
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(deck.favoriteCount);

  useEffect(() => {
    if (currentUserId) {
      actionCheckDeckFavorite({ deckId: deck.id }).then((result) => {
        if (result.success && result.data) {
          setIsFavorited(result.data.isFavorited);
          setFavoriteCount(result.data.favoriteCount);
        }
      });
    }
  }, [deck.id, currentUserId]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUserId) {
      toast.error(t("pleaseLogin"));
      return;
    }
    const result = await actionToggleDeckFavorite({ deckId: deck.id });
    if (result.success && result.data) {
      setIsFavorited(result.data.isFavorited);
      setFavoriteCount(result.data.favoriteCount);
      onUpdateFavorite(deck.id, result.data.isFavorited, result.data.favoriteCount);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div
      className="group cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white p-3 transition-all hover:border-primary-300 hover:shadow-md sm:border-2 sm:p-5"
      onClick={() => {
        router.push(`/explore/${deck.id}`);
      }}
    >
      <div className="mb-2 flex items-start justify-between sm:mb-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-500 sm:h-10 sm:w-10">
          <Layers size={18} className="sm:hidden" />
          <Layers size={22} className="hidden sm:block" />
        </div>
        <IconButton
          className="rounded-full"
          onClick={handleToggleFavorite}
          title={isFavorited ? t("unfavorite") : t("favorite")}
        >
          <Heart
            size={16}
            className={`sm:h-[18px] sm:w-[18px] sm:text-[18px] ${isFavorited ? "fill-red-500 text-red-500" : ""}`}
          />
        </IconButton>
      </div>

      <h3 className="mb-1 truncate text-sm font-semibold text-gray-900 sm:mb-2 sm:text-base">
        {deck.name}
      </h3>

      <p className="mb-2 line-clamp-2 text-xs text-gray-500 sm:mb-3 sm:text-sm">
        {t("deckInfo", {
          userName: deck.userName ?? deck.userUsername ?? t("unknownUser"),
          cardCount: deck.cardCount ?? 0,
        })}
      </p>

      <div className="flex items-center gap-1 text-xs text-gray-400 sm:text-sm">
        <Heart size={12} className="sm:h-3.5 sm:w-3.5" />
        <span>{favoriteCount}</span>
      </div>
    </div>
  );
};

interface ExploreClientProps {
  initialPublicDecks: ActionOutputPublicDeck[];
}

export function ExploreClient({ initialPublicDecks }: ExploreClientProps) {
  const t = useTranslations("explore");
  const router = useRouter();
  const [publicDecks, setPublicDecks] = useState<ActionOutputPublicDeck[]>(initialPublicDecks);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortByFavorites, setSortByFavorites] = useState(false);

  const isSingleUser = process.env.NEXT_PUBLIC_AUTH_MODE === "single";
  const { data: session } = authClient.useSession();
  const currentUserId = isSingleUser ? undefined : session?.user?.id;

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setPublicDecks(initialPublicDecks);
      return;
    }
    setLoading(true);
    const result = await actionSearchPublicDecks({ query: searchQuery.trim() });
    if (result.success && result.data) {
      setPublicDecks(result.data);
    }
    setLoading(false);
  };

  const handleToggleSort = () => {
    setSortByFavorites((prev) => !prev);
  };

  const sortedDecks = sortByFavorites
    ? [...publicDecks].sort((a, b) => b.favoriteCount - a.favoriteCount)
    : publicDecks;

  const handleUpdateFavorite = (deckId: number, _isFavorited: boolean, favoriteCount: number) => {
    setPublicDecks((prev) => prev.map((d) => (d.id === deckId ? { ...d, favoriteCount } : d)));
  };

  return (
    <PageLayout>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <HStack align="center" gap={2} className="mb-6">
        <Input
          variant="bordered"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder={t("searchPlaceholder")}
          leftIcon={<Search size={18} />}
          containerClassName="flex-1"
        />
        <IconButton
          onClick={handleToggleSort}
          title={sortByFavorites ? t("sortByFavoritesActive") : t("sortByFavorites")}
          className={`rounded-full ${sortByFavorites ? "bg-primary-100 text-primary-600 hover:bg-primary-200" : ""}`}
        >
          <ArrowUpDown size={18} />
        </IconButton>
        <IconButton className="rounded-full" onClick={handleSearch}>
          <Search size={18} />
        </IconButton>
      </HStack>

      {loading ? (
        <div className="p-8 text-center">
          <Skeleton variant="circular" className="mx-auto mb-3 h-8 w-8" />
          <p className="text-sm text-gray-500">{t("loading")}</p>
        </div>
      ) : sortedDecks.length === 0 ? (
        <div className="py-12 text-center text-gray-400">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <Layers size={24} className="text-gray-400" />
          </div>
          <p className="text-sm">{t("noDecks")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedDecks.map((deck) => (
            <PublicDeckCard
              key={deck.id}
              deck={deck}
              currentUserId={currentUserId}
              onUpdateFavorite={handleUpdateFavorite}
            />
          ))}
        </div>
      )}
    </PageLayout>
  );
}
