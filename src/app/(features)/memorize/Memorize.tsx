"use client";

import { Center } from "@/components/Center";
import { text_pair } from "../../../../generated/prisma/browser";
import Container from "@/components/cards/Container";
import { useEffect, useRef, useState } from "react";
import LightButton from "@/components/buttons/LightButton";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { getTTSAudioUrl } from "@/lib/browser/tts";
import { VOICES } from "@/config/locales";
import { useTranslations } from "next-intl";
import localFont from "next/font/local";

const myFont = localFont({
  src: "../../../../public/fonts/NotoNaskhArabic-VariableFont_wght.ttf",
});

interface MemorizeProps {
  textPairs: text_pair[];
}

const Memorize: React.FC<MemorizeProps> = ({ textPairs }) => {
  const t = useTranslations("memorize.memorize");
  const [reverse, setReverse] = useState(false);
  const [dictation, setDictation] = useState(false);
  const [disorder, setDisorder] = useState(false);
  const [index, setIndex] = useState(0);
  const [show, setShow] = useState<"question" | "answer">("question");
  const { load, play } = useAudioPlayer();

  const [disorderedTextPairs, setDisorderedTextPairs] = useState<text_pair[]>(
    [],
  );

  useEffect(() => {
    setDisorderedTextPairs(textPairs.toSorted(() => Math.random() - 0.5));
  }, [textPairs]);

  const getTextPairs = () => {
    if (disorder) {
      return disorderedTextPairs;
    }
    return textPairs.toSorted((a, b) => a.id - b.id);
  };

  return (
    <Center>
      <Container className="p-6 flex flex-col gap-8 h-96 justify-center items-center">
        {(getTextPairs().length > 0 && (
          <>
            <div
              className={`h-36 flex flex-col gap-2 justify-start items-center ${myFont.className} text-3xl`}
            >
              <div className="text-sm text-gray-500">
                {t("progress", {
                  current: index + 1,
                  total: getTextPairs().length,
                })}
              </div>
              {dictation ? (
                show === "question" ? (
                  ""
                ) : (
                  <>
                    <div>
                      {reverse
                        ? getTextPairs()[index].text2
                        : getTextPairs()[index].text1}
                    </div>
                    <div>
                      {reverse
                        ? getTextPairs()[index].text1
                        : getTextPairs()[index].text2}
                    </div>
                  </>
                )
              ) : (
                <>
                  <div>
                    {reverse
                      ? getTextPairs()[index].text2
                      : getTextPairs()[index].text1}
                  </div>
                  <div>
                    {show === "answer"
                      ? reverse
                        ? getTextPairs()[index].text1
                        : getTextPairs()[index].text2
                      : ""}
                  </div>
                </>
              )}
            </div>
            <div className="flex flex-row gap-2 items-center justify-center">
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
      </Container>
    </Center>
  );
};

export default Memorize;
