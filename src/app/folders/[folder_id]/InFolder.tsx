"use client";

import { ArrowLeft, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { redirect, useRouter } from "next/navigation";
import {
  createPair,
  deletePairById,
  getPairsByFolderId,
} from "@/lib/server/services/pairService";
import AddTextPairModal from "./AddTextPairModal";
import TextPairCard from "./TextPairCard";
import { useTranslations } from "next-intl";
import PageLayout from "@/components/ui/PageLayout";
import { GreenButton } from "@/components/ui/buttons";
import { logger } from "@/lib/logger";
import { IconButton } from "@/components/ui/buttons";
import CardList from "@/components/ui/CardList";

export interface TextPair {
  id: number;
  text1: string;
  text2: string;
  locale1: string;
  locale2: string;
}

export default function InFolder({ folderId }: { folderId: number }) {
  const [textPairs, setTextPairs] = useState<TextPair[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAddModal, setAddModal] = useState(false);
  const router = useRouter();
  const t = useTranslations("folder_id");

  useEffect(() => {
    const fetchTextPairs = async () => {
      setLoading(true);
      try {
        const data = await getPairsByFolderId(folderId);
        setTextPairs(data as TextPair[]);
      } catch (error) {
        logger.error("获取文本对失败", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTextPairs();
  }, [folderId]);

  const refreshTextPairs = async () => {
    try {
      const data = await getPairsByFolderId(folderId);
      setTextPairs(data as TextPair[]);
    } catch (error) {
      logger.error("获取文本对失败", error);
    }
  };

  return (
    <PageLayout>
      {/* 顶部导航和标题栏 */}
      <div className="mb-6">
        {/* 返回按钮 */}
        <button
          onClick={router.back}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          <span className="text-sm">{t("back")}</span>
        </button>

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
            <GreenButton
              onClick={() => {
                redirect(`/memorize?folder_id=${folderId}`);
              }}
            >
              {t("memorize")}
            </GreenButton>
            <IconButton
              onClick={() => {
                setAddModal(true);
              }}
              icon={<Plus size={18} className="text-gray-700" />}
            />
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
                  onDel={() => {
                    deletePairById(textPair.id);
                    refreshTextPairs();
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
          locale1: string,
          locale2: string,
        ) => {
          await createPair({
            text1: text1,
            text2: text2,
            locale1: locale1,
            locale2: locale2,
            folder: {
              connect: {
                id: folderId,
              },
            },
          });
          refreshTextPairs();
        }}
      />
    </PageLayout>
  );
}
