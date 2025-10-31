import LightButton from "@/components/buttons/LightButton";
import ACard from "@/components/cards/ACard";
import BCard from "@/components/cards/BCard";
import { WordData, WordDataSchema } from "@/interfaces";
import { Dispatch, SetStateAction } from "react";
import useFileUpload from "@/hooks/useFileUpload";
import NavbarCenterWrapper from "@/components/NavbarCenterWrapper";
import { useTranslations } from "next-intl";

interface Props {
  wordData: WordData;
  setWordData: Dispatch<SetStateAction<WordData>>;
  setPage: Dispatch<SetStateAction<"start" | "main" | "edit">>;
}

export default function Main({
  wordData,
  setWordData,
  setPage: setPage,
}: Props) {
  const t = useTranslations("memorize.main");
  const { upload, inputRef } = useFileUpload(async (file) => {
    try {
      const obj = JSON.parse(await file.text());
      const newWordData = WordDataSchema.parse(obj);
      setWordData(newWordData);
    } catch (error) {
      console.error(error);
    }
  });
  const handleLoad = async () => {
    upload("application/json");
  };
  const handleSave = () => {
    const blob = new Blob([JSON.stringify(wordData)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "word_data.json";
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <NavbarCenterWrapper className="bg-gray-100">
      <ACard className="flex-col flex">
        <h1 className="text-center font-extrabold text-4xl text-gray-800 m-2 mb-4">
          {t("title")}
        </h1>
        <div className="flex-1 font-serif text-2xl w-full h-full text-gray-800">
          <BCard>
            <p>{t("locale1", { locale: wordData.locales[0] })}</p>
            <p>{t("locale2", { locale: wordData.locales[1] })}</p>
            <p>{t("total", { total: wordData.wordPairs.length })}</p>
          </BCard>
        </div>
        <div className="w-full flex items-center justify-center">
          <BCard className="flex gap-2 justify-center items-center w-fit">
            <LightButton onClick={() => setPage("start")}>
              {t("start")}
            </LightButton>
            <LightButton onClick={handleLoad}>{t("import")}</LightButton>
            <LightButton onClick={handleSave}>{t("export")}</LightButton>
            <LightButton onClick={() => setPage("edit")}>
              {t("edit")}
            </LightButton>
          </BCard>
        </div>
      </ACard>
      <input type="file" hidden ref={inputRef}></input>
    </NavbarCenterWrapper>
  );
}
