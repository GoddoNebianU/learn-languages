"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Letter, SupportedAlphabets } from "@/lib/interfaces";
import { PageLayout } from "@/components/ui/PageLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { AlphabetCard } from "./AlphabetCard";

const alphabetOptions: { value: SupportedAlphabets; label: string; color: string }[] = [
  { value: "japanese", label: "あいうえお", color: "#a56068" },
  { value: "english", label: "ABC", color: "#578aad" },
  { value: "uyghur", label: "ئۇيغۇر", color: "#3c988d" },
  { value: "esperanto", label: "ABCĜĤ", color: "#dd7486" },
];

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
        <PageHeader title={t("chooseCharacters")} subtitle={t("chooseAlphabetHint")} />

        <div className="grid grid-cols-2 gap-4">
          {alphabetOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setChosenAlphabet(option.value)}
              className="group bg-white border border-gray-200 sm:border-2 rounded-lg p-4 sm:p-6 hover:border-primary-300 hover:shadow-md cursor-pointer transition-all text-center"
            >
              <span
                className="block text-3xl sm:text-4xl font-bold mb-2"
                style={{ color: option.color }}
              >
                {option.label}
              </span>
              <span className="text-sm sm:text-base text-gray-600">
                {t(option.value)}
              </span>
            </button>
          ))}
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
