"use client";

import { useState } from "react";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { getTTSAudioUrl } from "@/lib/browser/tts";
import { VOICES } from "@/config/locales";
import { useTranslations } from "next-intl";
import localFont from "next/font/local";
import { isNonNegativeInteger, SeededRandom } from "@/lib/utils";
import { Pair } from "../../../../generated/prisma/browser";

const myFont = localFont({
  src: "../../../../public/fonts/NotoNaskhArabic-VariableFont_wght.ttf",
});

interface MemorizeProps {
  textPairs: Pair[];
}

const Memorize: React.FC<MemorizeProps> = ({ textPairs }) => {
  const t = useTranslations("memorize.memorize");
  const [reverse, setReverse] = useState(false);
  const [dictation, setDictation] = useState(false);
  const [disorder, setDisorder] = useState(false);
  const [index, setIndex] = useState(0);
  const [show, setShow] = useState<"question" | "answer">("question");
  const { load, play } = useAudioPlayer();

  if (textPairs.length === 0) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-[#35786f] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <p className="text-gray-700">{t("noTextPairs")}</p>
        </div>
      </div>
    );
  }

  const rng = new SeededRandom(textPairs[0].folderId);
  const disorderedTextPairs = textPairs.toSorted(() => rng.next() - 0.5);

  textPairs.sort((a, b) => a.id - b.id);

  const getTextPairs = () => disorder ? disorderedTextPairs : textPairs;

  const handleIndexClick = () => {
    const newIndex = prompt("Input a index number.")?.trim();
    if (
      newIndex &&
      isNonNegativeInteger(newIndex) &&
      parseInt(newIndex) <= textPairs.length &&
      parseInt(newIndex) > 0
    ) {
      setIndex(parseInt(newIndex) - 1);
    }
  };

  const handleNext = async () => {
    if (show === "answer") {
      const newIndex = (index + 1) % getTextPairs().length;
      setIndex(newIndex);
      if (dictation)
        getTTSAudioUrl(
          getTextPairs()[newIndex][reverse ? "text2" : "text1"],
          VOICES.find(
            (v) =>
              v.locale ===
              getTextPairs()[newIndex][
              reverse ? "locale2" : "locale1"
              ],
          )!.short_name,
        ).then((url) => {
          load(url);
          play();
        });
    }
    setShow(show === "question" ? "answer" : "question");
  };

  const handlePrevious = () => {
    setIndex(
      (index - 1 + getTextPairs().length) % getTextPairs().length,
    );
    setShow("question");
  };

  const toggleReverse = () => setReverse(!reverse);
  const toggleDictation = () => setDictation(!dictation);
  const toggleDisorder = () => setDisorder(!disorder);

  const createText = (text: string) => {
    return (
      <div className="text-gray-900 text-xl md:text-2xl p-6 h-[20dvh] overflow-y-auto text-center">
        {text}
      </div>
    );
  };

  const [text1, text2] = reverse
    ? [getTextPairs()[index].text2, getTextPairs()[index].text1]
    : [getTextPairs()[index].text1, getTextPairs()[index].text2];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#35786f] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          {/* 进度指示器 */}
          <div className="flex justify-center mb-4">
            <button
              onClick={handleIndexClick}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              {index + 1} / {getTextPairs().length}
            </button>
          </div>

          {/* 文本显示区域 */}
          <div className={`h-[40dvh] ${myFont.className} mb-4`}>
            {(() => {
              if (dictation) {
                if (show === "question") {
                  return (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-gray-400 text-4xl">?</div>
                    </div>
                  );
                } else {
                  return (
                    <div className="space-y-2">
                      {createText(text1)}
                      <div className="border-t border-gray-200"></div>
                      {createText(text2)}
                    </div>
                  );
                }
              } else {
                if (show === "question") {
                  return createText(text1);
                } else {
                  return (
                    <div className="space-y-2">
                      {createText(text1)}
                      <div className="border-t border-gray-200"></div>
                      {createText(text2)}
                    </div>
                  );
                }
              }
            })()}
          </div>

          {/* 底部按钮 */}
          <div className="flex flex-row gap-2 items-center justify-center flex-wrap">
            <button
              onClick={handleNext}
              className="px-4 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors text-sm"
            >
              {show === "question" ? t("answer") : t("next")}
            </button>
            <button
              onClick={handlePrevious}
              className="px-4 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors text-sm"
            >
              {t("previous")}
            </button>
            <button
              onClick={toggleReverse}
              className={`px-4 py-2 rounded-full transition-colors text-sm ${
                reverse
                  ? "bg-[#35786f] text-white hover:bg-[#2d5f58]"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {t("reverse")}
            </button>
            <button
              onClick={toggleDictation}
              className={`px-4 py-2 rounded-full transition-colors text-sm ${
                dictation
                  ? "bg-[#35786f] text-white hover:bg-[#2d5f58]"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {t("dictation")}
            </button>
            <button
              onClick={toggleDisorder}
              className={`px-4 py-2 rounded-full transition-colors text-sm ${
                disorder
                  ? "bg-[#35786f] text-white hover:bg-[#2d5f58]"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {t("disorder")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Memorize;
