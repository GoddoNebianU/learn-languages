"use client";

import { Folder as Fd, Heart, ExternalLink, ArrowLeft } from "lucide-react";
import { CircleButton } from "@/design-system/base/button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import Link from "next/link";
import {
  actionToggleFavorite,
  actionCheckFavorite,
} from "@/modules/folder/folder-action";
import { ActionOutputPublicFolder } from "@/modules/folder/folder-action-dto";
import { authClient } from "@/lib/auth-client";

interface ExploreDetailClientProps {
  folder: ActionOutputPublicFolder;
}

export function ExploreDetailClient({ folder }: ExploreDetailClientProps) {
  const router = useRouter();
  const t = useTranslations("exploreDetail");
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(folder.favoriteCount);

  const { data: session } = authClient.useSession();
  const currentUserId = session?.user?.id;

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

  const handleToggleFavorite = async () => {
    if (!currentUserId) {
      toast.error(t("pleaseLogin"));
      return;
    }
    const result = await actionToggleFavorite(folder.id);
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
    return new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
        <div className="flex items-center gap-3 mb-6">
          <CircleButton onClick={() => router.push("/explore")}>
            <ArrowLeft size={18} />
          </CircleButton>
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
            {t("title")}
          </h1>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-8 shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-primary-50 flex items-center justify-center text-primary-500">
                <Fd size={28} className="sm:w-8 sm:h-8" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {folder.name}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {t("createdBy", {
                    name: folder.userName ?? folder.userUsername ?? t("unknownUser"),
                  })}
                </p>
              </div>
            </div>
            <CircleButton
              onClick={handleToggleFavorite}
              title={isFavorited ? t("unfavorite") : t("favorite")}
              className="shrink-0"
            >
              <Heart
                size={20}
                className={isFavorited ? "fill-red-500 text-red-500" : ""}
              />
            </CircleButton>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6 py-4 border-y border-gray-100">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary-600">
                {folder.totalPairs}
              </div>
              <div className="text-xs sm:text-sm text-gray-500 mt-1">
                {t("totalPairs")}
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
                {formatDate(folder.createdAt)}
              </div>
              <div className="text-xs sm:text-sm text-gray-500 mt-1">
                {t("createdAt")}
              </div>
            </div>
          </div>

          <Link
            href={`/folders/${folder.id}`}
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
