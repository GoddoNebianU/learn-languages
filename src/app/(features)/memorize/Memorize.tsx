"use client";

import { useState } from "react";
import { LinkButton, CircleToggleButton, LightButton } from "@/design-system/base/button";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { getTTSUrl, TTS_SUPPORTED_LANGUAGES } from "@/lib/bigmodel/tts";
import { useTranslations } from "next-intl";
import localFont from "next/font/local";
import { isNonNegativeInteger, SeededRandom } from "@/utils/random";
import { TSharedPair } from "@/shared/folder-type";
import { PageLayout } from "@/components/ui/PageLayout";

const myFont = localFont({
  src: "../../../../public/fonts/NotoNaskhArabic-VariableFont_wght.ttf",
});

interface MemorizeProps {
  textPairs: TSharedPair[];
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
      <PageLayout>
        <p className="text-gray-700 text-center">{t("noTextPairs")}</p>
      </PageLayout>
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
      if (dictation) {
        const textPair = getTextPairs()[newIndex];
        const language = textPair[reverse ? "language2" : "language1"];
        const text = textPair[reverse ? "text2" : "text1"];

        // 映射语言到 TTS 支持的格式
        const languageMap: Record<string, TTS_SUPPORTED_LANGUAGES> = {
          "chinese": "Chinese",
          "english": "English",
          "japanese": "Japanese",
          "korean": "Korean",
          "french": "French",
          "german": "German",
          "italian": "Italian",
          "portuguese": "Portuguese",
          "spanish": "Spanish",
          "russian": "Russian",
        };

        const ttsLanguage = languageMap[language?.toLowerCase()] || "Auto";

        getTTSUrl(text, ttsLanguage).then((url) => {
          load(url);
          play();
        });
      }
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
    <PageLayout>
      {/* 进度指示器 */}
      <div className="flex justify-center mb-4">
        <LinkButton onClick={handleIndexClick} className="text-sm">
          {index + 1} / {getTextPairs().length}
        </LinkButton>
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
        <LightButton
          onClick={handleNext}
          className="px-4 py-2 rounded-full text-sm"
        >
          {show === "question" ? t("answer") : t("next")}
        </LightButton>
        <LightButton
          onClick={handlePrevious}
          className="px-4 py-2 rounded-full text-sm"
        >
          {t("previous")}
        </LightButton>
        <CircleToggleButton
          selected={reverse}
          onClick={toggleReverse}
        >
          {t("reverse")}
        </CircleToggleButton>
        <CircleToggleButton
          selected={dictation}
          onClick={toggleDictation}
        >
          {t("dictation")}
        </CircleToggleButton>
        <CircleToggleButton
          selected={disorder}
          onClick={toggleDisorder}
        >
          {t("disorder")}
        </CircleToggleButton>
      </div>
    </PageLayout>
  );
};

export { Memorize };
