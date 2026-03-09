"use client";

import { ArrowLeft, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { redirect, useRouter } from "next/navigation";
import { AddTextPairModal } from "./AddTextPairModal";
import { TextPairCard } from "./TextPairCard";
import { useTranslations } from "next-intl";
import { PageLayout } from "@/components/ui/PageLayout";
import { PrimaryButton, CircleButton, LinkButton } from "@/design-system/base/button";
import { CardList } from "@/components/ui/CardList";
import { actionCreatePair, actionDeletePairById, actionGetPairsByFolderId } from "@/modules/folder/folder-action";
import { TSharedPair } from "@/shared/folder-type";
import { toast } from "sonner";


export function InFolder({ folderId, isReadOnly }: { folderId: number; isReadOnly: boolean; }) {
  const [textPairs, setTextPairs] = useState<TSharedPair[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAddModal, setAddModal] = useState(false);
  const router = useRouter();
  const t = useTranslations("folder_id");

  useEffect(() => {
    const fetchTextPairs = async () => {
      setLoading(true);
      await actionGetPairsByFolderId(folderId)
        .then(result => {
          if (!result.success || !result.data) {
            throw new Error(result.message || "Failed to load text pairs");
          }
          return result.data;
        }).then(setTextPairs)
        .catch((error) => {
          toast.error(error instanceof Error ? error.message : "Unknown error");
        })
        .finally(() => {
          setLoading(false);
        });
    };
    fetchTextPairs();
  }, [folderId]);

  const refreshTextPairs = async () => {
    await actionGetPairsByFolderId(folderId)
      .then(result => {
        if (!result.success || !result.data) {
          throw new Error(result.message || "Failed to refresh text pairs");
        }
        return result.data;
      }).then(setTextPairs)
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : "Unknown error");
      });
  };

  return (
    <PageLayout>
      {/* 顶部导航和标题栏 */}
      <div className="mb-6">
        {/* 返回按钮 */}
        <LinkButton
          onClick={router.back}
          className="flex items-center gap-2 mb-4"
        >
          <ArrowLeft size={16} />
          <span className="text-sm">{t("back")}</span>
        </LinkButton>

        {/* 页面标题和操作按钮 */}
        <div className="flex items-center justify-between">
          {/* 标题区域 */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">
              {t("textPairs")}
            </h1>
            <p className="text-sm text-gray-500">
              {t("itemsCount", { count: textPairs.length })}
            </p>
          </div>

          {/* 操作按钮区域 */}
          <div className="flex items-center gap-2">
            <PrimaryButton
              onClick={() => {
                redirect(`/memorize?folder_id=${folderId}`);
              }}
            >
              {t("memorize")}
            </PrimaryButton>
            {!isReadOnly && (
              <CircleButton
                onClick={() => {
                  setAddModal(true);
                }}
              >
                <Plus size={18} className="text-gray-700" />
              </CircleButton>
            )}
          </div>
        </div>
      </div>

      {/* 文本对列表 */}
      <CardList>
        {loading ? (
          // 加载状态
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-gray-500">{t("loadingTextPairs")}</p>
          </div>
        ) : textPairs.length === 0 ? (
          // 空状态
          <div className="p-12 text-center">
            <p className="text-sm text-gray-500 mb-2">{t("noTextPairs")}</p>
          </div>
        ) : (
          // 文本对卡片列表
          <div className="divide-y divide-gray-100">
            {textPairs
              .toSorted((a, b) => a.id - b.id)
              .map((textPair) => (
                <TextPairCard
                  key={textPair.id}
                  textPair={textPair}
                  isReadOnly={isReadOnly}
                  onDel={() => {
                    actionDeletePairById(textPair.id)
                      .then(result => {
                        if (!result.success) throw new Error(result.message || "Delete failed");
                      }).then(refreshTextPairs)
                      .catch((error) => {
                        toast.error(error instanceof Error ? error.message : "Unknown error");
                      });
                  }}
                  refreshTextPairs={refreshTextPairs}
                />
              ))}
          </div>
        )}
      </CardList>

      {/* 添加文本对模态框 */}
      <AddTextPairModal
        isOpen={openAddModal}
        onClose={() => setAddModal(false)}
        onAdd={async (
          text1: string,
          text2: string,
          language1: string,
          language2: string,
        ) => {
          await actionCreatePair({
            text1: text1,
            text2: text2,
            language1: language1,
            language2: language2,
            folderId: folderId,
          });
          refreshTextPairs();
        }}
      />
    </PageLayout>
  );
};
