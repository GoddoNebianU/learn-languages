import LightButton from "@/components/buttons/LightButton";
import ACard from "@/components/cards/ACard";
import BCard from "@/components/cards/BCard";
import { LOCALES } from "@/config/locales";
import { Dispatch, SetStateAction, useState } from "react";
import { WordData } from "@/interfaces";

import { useTranslations } from "next-intl";

interface Props {
  setEditPage: Dispatch<SetStateAction<"choose" | "edit">>;
  wordData: WordData;
  setWordData: Dispatch<SetStateAction<WordData>>;
  localeKey: 0 | 1;
}

export default function Choose({
  setEditPage,
  wordData,
  setWordData,
  localeKey,
}: Props) {
  const t = useTranslations("memorize.choose");
  const [chosenLocale, setChosenLocale] = useState<
    (typeof LOCALES)[number] | null
  >(null);

  const handleChooseClick = () => {
    if (chosenLocale) {
      setWordData({
        locales: [
          localeKey === 0 ? chosenLocale : wordData.locales[0],
          localeKey === 1 ? chosenLocale : wordData.locales[1],
        ],
        wordPairs: wordData.wordPairs,
      });
      setEditPage("edit");
    }
  };

  return (
    <div className="w-screen flex justify-center items-center">
      <ACard className="flex flex-col">
        <div className="overflow-y-auto flex-1 border border-gray-200 rounded-2xl p-2 grid grid-cols-4 md:grid-cols-6 md:gap-2">
          {LOCALES.map((locale, index) => (
            <LightButton
              key={index}
              className="md:w-26 w-18"
              selected={locale === chosenLocale}
              onClick={() => setChosenLocale(locale)}
            >
              {locale}
            </LightButton>
          ))}
        </div>
        <div className="w-full flex items-center justify-center">
          <BCard className="flex gap-2 justify-center items-center w-fit">
            <LightButton onClick={handleChooseClick}>{t("choose")}</LightButton>
            <LightButton onClick={() => setEditPage("edit")}>
              {t("back")}
            </LightButton>
          </BCard>
        </div>
      </ACard>
    </div>
  );
}
