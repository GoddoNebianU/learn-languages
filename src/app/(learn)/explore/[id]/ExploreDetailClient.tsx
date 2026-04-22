"use client";

import { Layers, Heart, ExternalLink, ArrowLeft } from "lucide-react";
import { IconButton } from "@/design-system/icon-button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import Link from "next/link";
import {
  actionToggleDeckFavorite,
  actionCheckDeckFavorite,
} from "@/modules/deck/deck-action";
import type { ActionOutputPublicDeck } from "@/modules/deck/deck-action-dto";
import { authClient } from "@/lib/auth-client";

interface ExploreDetailClientProps {
  deck: ActionOutputPublicDeck;
}

export function ExploreDetailClient({ deck }: ExploreDetailClientProps) {
  const router = useRouter();
  const t = useTranslations("exploreDetail");
  const locale = useLocale();
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(deck.favoriteCount);

  const { data: session } = authClient.useSession();
  const currentUserId = session?.user?.id;

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

  const handleToggleFavorite = async () => {
    if (!currentUserId) {
      toast.error(t("pleaseLogin"));
      return;
    }
    const result = await actionToggleDeckFavorite({ deckId: deck.id });
    if (result.success && result.data) {
      setIsFavorited(result.data.isFavorited);
      setFavoriteCount(result.data.favoriteCount);
      toast.success(
        result.data.isFavorited ? t("favorited") : t("unfavorited")
      );
    } else {
      toast.error(result.message);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
        <div className="flex items-center gap-3 mb-6">
          <IconButton className="rounded-full" onClick={() => router.push("/explore")}>
            <ArrowLeft size={18} />
          </IconButton>
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
            {t("title")}
          </h1>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-8 shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-primary-50 flex items-center justify-center text-primary-500">
                <Layers size={28} className="sm:w-8 sm:h-8" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {deck.name}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {t("createdBy", {
                    name: deck.userName ?? deck.userUsername ?? t("unknownUser"),
                  })}
                </p>
              </div>
            </div>
            <IconButton onClick={handleToggleFavorite}
              title={isFavorited ? t("unfavorite") : t("favorite")}
              className="rounded-full shrink-0">
              <Heart
                size={20}
                className={isFavorited ? "fill-red-500 text-red-500" : ""}
              />
            </IconButton>
          </div>

          {deck.desc && (
            <p className="text-gray-600 mb-6 text-sm sm:text-base">
              {deck.desc}
            </p>
          )}

          <div className="grid grid-cols-3 gap-4 mb-6 py-4 border-y border-gray-100">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary-600">
                {deck.cardCount ?? 0}
              </div>
              <div className="text-xs sm:text-sm text-gray-500 mt-1">
                {t("totalCards")}
              </div>
            </div>
            <div className="text-center border-x border-gray-100">
              <div className="text-2xl sm:text-3xl font-bold text-red-500 flex items-center justify-center gap-1">
                <Heart size={18} className={isFavorited ? "fill-red-500" : ""} />
                {favoriteCount}
              </div>
              <div className="text-xs sm:text-sm text-gray-500 mt-1">
                {t("favorites")}
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-xl font-semibold text-gray-700">
                {formatDate(deck.createdAt)}
              </div>
              <div className="text-xs sm:text-sm text-gray-500 mt-1">
                {t("createdAt")}
              </div>
            </div>
          </div>

          <Link
            href={`/decks/${deck.id}`}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
          >
            <ExternalLink size={18} />
            {t("viewContent")}
          </Link>
        </div>
      </div>
    </div>
  );
}
