import LightButton from "@/components/buttons/LightButton";
import ACard from "@/components/cards/ACard";
import BCard from "@/components/cards/BCard";
import { ChangeEvent, Dispatch, SetStateAction, useRef, useState } from "react";
import DarkButton from "@/components/buttons/DarkButton";
import { WordData } from "@/lib/interfaces";
import Choose from "./Choose";

import { useTranslations } from "next-intl";

interface Props {
  setPage: Dispatch<SetStateAction<"start" | "main" | "edit">>;
  wordData: WordData;
  setWordData: Dispatch<SetStateAction<WordData>>;
}

export default function Edit({ setPage, wordData, setWordData }: Props) {
  const t = useTranslations("memorize.edit");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [localeKey, setLocaleKey] = useState<0 | 1>(0);
  const [editPage, setEditPage] = useState<"choose" | "edit">("edit");
  const convertIntoWordData = (text: string) => {
    const t1 = text
      .replace("，", ",")
      .split("\n")
      .map((v) => v.trim())
      .filter((v) => v.includes(","));
    const t2 = t1
      .map((v) => {
        const [left, right] = v.split(",", 2).map((v) => v.trim());
        if (left && right) return [left, right] as [string, string];
        else return null;
      })
      .filter((v) => v !== null);
    const new_data: WordData = {
      locales: [...wordData.locales],
      wordPairs: t2,
    };
    return new_data;
  };
  const convertFromWordData = (wdata: WordData) => {
    let result = "";
    for (const pair of wdata.wordPairs) {
      result += `${pair[0]}, ${pair[1]}\n`;
    }
    return result;
  };
  let input = convertFromWordData(wordData);
  const handleSave = () => {
    const newWordData = convertIntoWordData(input);
    setWordData(newWordData);
    if (textareaRef.current)
      textareaRef.current.value = convertFromWordData(newWordData);
    if (localStorage) {
      localStorage.setItem("wordData", JSON.stringify(newWordData));
    }
  };
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    input = e.target.value;
  };
  if (editPage === "edit")
    return (
      <div className="w-screen flex justify-center items-center">
        <ACard className="flex flex-col">
          <textarea
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.ctrlKey) handleSave();
            }}
            ref={textareaRef}
            className="flex-1 text-gray-800 font-mono md:text-2xl border-gray-200 border rounded-2xl w-full resize-none outline-0 p-2"
            defaultValue={input}
            onChange={handleChange}
          ></textarea>
          <div className="w-full flex items-center justify-center">
            <BCard className="flex gap-2 justify-center items-center w-fit">
              <LightButton onClick={() => setPage("main")}>
                {t("back")}
              </LightButton>
              <LightButton onClick={handleSave}>{t("save")}</LightButton>
              <DarkButton
                onClick={() => {
                  setLocaleKey(0);
                  setEditPage("choose");
                }}
              >
                {t("locale1")}
              </DarkButton>
              <DarkButton
                onClick={() => {
                  setLocaleKey(1);
                  setEditPage("choose");
                }}
              >
                {t("locale2")}
              </DarkButton>
            </BCard>
          </div>
        </ACard>
      </div>
    );
  if (editPage === "choose")
    return (
      <Choose
        wordData={wordData}
        setEditPage={setEditPage}
        setWordData={setWordData}
        localeKey={localeKey}
      ></Choose>
    );
}
