"use client";

import { Layers, Heart, ExternalLink, ArrowLeft } from "lucide-react";
import { IconButton } from "@/design-system/icon-button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import Link from "next/link";
import { actionToggleDeckFavorite, actionCheckDeckFavorite } from "@/modules/deck/deck-action";
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
      toast.success(result.data.isFavorited ? t("favorited") : t("unfavorited"));
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
      <div className="mx-auto max-w-3xl px-4 py-6 sm:py-8">
        <div className="mb-6 flex items-center gap-3">
          <IconButton className="rounded-full" onClick={() => router.push("/explore")}>
            <ArrowLeft size={18} />
          </IconButton>
          <h1 className="text-lg font-semibold text-gray-900 sm:text-xl">{t("title")}</h1>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="mb-6 flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-50 text-primary-500 sm:h-16 sm:w-16">
                <Layers size={28} className="sm:h-8 sm:w-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">{deck.name}</h2>
                <p className="mt-1 text-sm text-gray-500">
                  {t("createdBy", {
                    name: deck.userName ?? deck.userUsername ?? t("unknownUser"),
                  })}
                </p>
              </div>
            </div>
            <IconButton
              onClick={handleToggleFavorite}
              title={isFavorited ? t("unfavorite") : t("favorite")}
              className="shrink-0 rounded-full"
            >
              <Heart size={20} className={isFavorited ? "fill-red-500 text-red-500" : ""} />
            </IconButton>
          </div>

          {deck.desc && <p className="mb-6 text-sm text-gray-600 sm:text-base">{deck.desc}</p>}

          <div className="mb-6 grid grid-cols-3 gap-4 border-y border-gray-100 py-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600 sm:text-3xl">
                {deck.cardCount ?? 0}
              </div>
              <div className="mt-1 text-xs text-gray-500 sm:text-sm">{t("totalCards")}</div>
            </div>
            <div className="border-x border-gray-100 text-center">
              <div className="flex items-center justify-center gap-1 text-2xl font-bold text-red-500 sm:text-3xl">
                <Heart size={18} className={isFavorited ? "fill-red-500" : ""} />
                {favoriteCount}
              </div>
              <div className="mt-1 text-xs text-gray-500 sm:text-sm">{t("favorites")}</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-700 sm:text-xl">
                {formatDate(deck.createdAt)}
              </div>
              <div className="mt-1 text-xs text-gray-500 sm:text-sm">{t("createdAt")}</div>
            </div>
          </div>

          <Link
            href={`/decks/${deck.id}`}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-500 px-4 py-3 font-medium text-white transition-colors hover:bg-primary-600"
          >
            <ExternalLink size={18} />
            {t("viewContent")}
          </Link>
        </div>
      </div>
    </div>
  );
}
