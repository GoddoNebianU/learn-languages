"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Letter, SupportedAlphabets } from "@/lib/interfaces";
import { PageLayout } from "@/components/ui/PageLayout";
import { LightButton } from "@/components/ui/buttons";
import { AlphabetCard } from "./AlphabetCard";

export default function Alphabet() {
  const t = useTranslations("alphabet");
  const [chosenAlphabet, setChosenAlphabet] = useState<SupportedAlphabets | null>(null);
  const [alphabetData, setAlphabetData] = useState<Letter[] | null>(null);
  const [loadingState, setLoadingState] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    const loadAlphabetData = async () => {
      if (chosenAlphabet && !alphabetData) {
        try {
          setLoadingState("loading");
          
          const res = await fetch("/alphabets/" + chosenAlphabet + ".json");
          if (!res.ok) throw new Error("Network response was not ok");
          
          const obj = await res.json();
          setAlphabetData(obj as Letter[]);
          setLoadingState("success");
        } catch (error) {
          setLoadingState("error");
        }
      }
    };

    loadAlphabetData();
  }, [chosenAlphabet, alphabetData]);

  useEffect(() => {
    if (loadingState === "error") {
      const timer = setTimeout(() => {
        setLoadingState("idle");
        setChosenAlphabet(null);
        setAlphabetData(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [loadingState]);

  // 语言选择界面
  if (!chosenAlphabet) {
    return (
      <PageLayout>
        {/* 页面标题 */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          {t("chooseCharacters")}
        </h1>
        {/* 副标题说明 */}
        <p className="text-gray-600 mb-8 text-lg">
          选择一种语言的字母表开始学习
        </p>

        {/* 语言选择按钮网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 日语假名选项 */}
          <LightButton
            onClick={() => setChosenAlphabet("japanese")}
            className="p-6 text-lg font-medium hover:scale-105 transition-transform"
          >
            <div className="flex flex-col items-center">
              <span className="text-2xl mb-2">あいうえお</span>
              <span>{t("japanese")}</span>
            </div>
          </LightButton>

          {/* 英语字母选项 */}
          <LightButton
            onClick={() => setChosenAlphabet("english")}
            className="p-6 text-lg font-medium hover:scale-105 transition-transform"
          >
            <div className="flex flex-col items-center">
              <span className="text-2xl mb-2">ABC</span>
              <span>{t("english")}</span>
            </div>
          </LightButton>

          {/* 维吾尔语字母选项 */}
          <LightButton
            onClick={() => setChosenAlphabet("uyghur")}
            className="p-6 text-lg font-medium hover:scale-105 transition-transform"
          >
            <div className="flex flex-col items-center">
              <span className="text-2xl mb-2">ئۇيغۇر</span>
              <span>{t("uyghur")}</span>
            </div>
          </LightButton>

          {/* 世界语字母选项 */}
          <LightButton
            onClick={() => setChosenAlphabet("esperanto")}
            className="p-6 text-lg font-medium hover:scale-105 transition-transform"
          >
            <div className="flex flex-col items-center">
              <span className="text-2xl mb-2">ABCĜĤ</span>
              <span>{t("esperanto")}</span>
            </div>
          </LightButton>
        </div>
      </PageLayout>
    );
  }

  // 加载状态
  if (loadingState === "loading") {
    return (
      <PageLayout>
        <div className="text-2xl text-gray-600 text-center">{t("loading")}</div>
      </PageLayout>
    );
  }

  // 错误状态
  if (loadingState === "error") {
    return (
      <PageLayout>
        <div className="text-2xl text-red-600 text-center">{t("loadFailed")}</div>
      </PageLayout>
    );
  }

  // 字母卡片界面
  if (loadingState === "success" && alphabetData) {
    return (
      <AlphabetCard
        alphabet={alphabetData}
        alphabetType={chosenAlphabet}
        onBack={() => {
          setChosenAlphabet(null);
          setAlphabetData(null);
          setLoadingState("idle");
        }}
      />
    );
  }

  return null;
}
