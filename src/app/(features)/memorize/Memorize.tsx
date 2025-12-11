"use client";

import { useState } from "react";
import LightButton from "@/components/ui/buttons/LightButton";
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
    return <p>{t("noTextPairs")}</p>;
  }

  const rng = new SeededRandom(textPairs[0].folderId);
  const disorderedTextPairs = textPairs.toSorted(() => rng.next() - 0.5);

  textPairs.sort((a, b) => a.id - b.id);

  const getTextPairs = () => disorder ? disorderedTextPairs : textPairs;

  return (
    <>
      {(getTextPairs().length > 0 && (
        <>
          <div className="text-center">
            <div
              className="text-sm text-gray-500"
              onClick={() => {
                const newIndex = prompt("Input a index number.")?.trim();
                if (
                  newIndex &&
                  isNonNegativeInteger(newIndex) &&
                  parseInt(newIndex) <= textPairs.length &&
                  parseInt(newIndex) > 0
                ) {
                  setIndex(parseInt(newIndex) - 1);
                }
              }}
            >
              {index + 1}
              {"/" + getTextPairs().length}
            </div>
            <div className={`h-[40dvh] md:px-16 px-4 ${myFont.className}`}>
              {(() => {
                const createText = (text: string) => {
                  return (
                    <div className="text-gray-900 text-xl border-y border-y-gray-200 p-4 md:text-3xl h-[20dvh] overflow-y-auto">
                      {text}
                    </div>
                  );
                };

                const [text1, text2] = reverse
                  ? [getTextPairs()[index].text2, getTextPairs()[index].text1]
                  : [getTextPairs()[index].text1, getTextPairs()[index].text2];

                if (dictation) {
                  // dictation
                  if (show === "question") {
                    return createText("");
                  } else {
                    return (
                      <>
                        {createText(text1)}
                        {createText(text2)}
                      </>
                    );
                  }
                } else {
                  // non-dictation
                  if (show === "question") {
                    return createText(text1);
                  } else {
                    return (
                      <>
                        {createText(text1)}
                        {createText(text2)}
                      </>
                    );
                  }
                }
              })()}
            </div>
          </div>
          <div className="flex flex-row gap-2 items-center justify-center flex-wrap">
            <LightButton
              className="w-20"
              onClick={async () => {
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
              }}
            >
              {show === "question" ? t("answer") : t("next")}
            </LightButton>
            <LightButton
              onClick={() => {
                setIndex(
                  (index - 1 + getTextPairs().length) % getTextPairs().length,
                );
                setShow("question");
              }}
            >
              {t("previous")}
            </LightButton>
            <LightButton
              onClick={() => {
                setReverse(!reverse);
              }}
              selected={reverse}
            >
              {t("reverse")}
            </LightButton>
            <LightButton
              onClick={() => {
                setDictation(!dictation);
              }}
              selected={dictation}
            >
              {t("dictation")}
            </LightButton>
            <LightButton
              onClick={() => {
                setDisorder(!disorder);
              }}
              selected={disorder}
            >
              {t("disorder")}
            </LightButton>
          </div>
        </>
      )) || <p>{t("noTextPairs")}</p>}
    </>
  );
};

export default Memorize;
