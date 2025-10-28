import LightButton from "@/components/buttons/LightButton";
import ACard from "@/components/cards/ACard";
import BCard from "@/components/cards/BCard";
import Window from "@/components/Window";
import { ChangeEvent, Dispatch, SetStateAction, useState } from "react";
import DarkButton from "@/components/buttons/DarkButton";
import { WordData } from "./page";
import Choose from "./Choose";

interface Props {
  setPage: Dispatch<SetStateAction<"start" | "main" | "edit">>;
  wordData: WordData;
  setWordData: Dispatch<SetStateAction<WordData>>;
}

export default function Edit({ setPage, wordData, setWordData }: Props) {
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
    setWordData(new_data);
  };
  const convertFromWordData = () => {
    let result = "";
    for (const pair of wordData.wordPairs) {
      result += `${pair[0]}, ${pair[1]}\n`;
    }
    return result;
  };
  let input = convertFromWordData();
  const handleSave = () => {
    convertIntoWordData(input);
  };
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    input = e.target.value;
  };
  if (editPage === "edit")
    return (
      <Window>
        <ACard className="flex flex-col">
          <textarea
            className="flex-1 text-gray-800 font-serif text-2xl border-gray-200 border rounded-2xl w-full resize-none outline-0 p-2"
            defaultValue={input}
            onChange={handleChange}
          ></textarea>
          <div className="w-full flex items-center justify-center">
            <BCard className="flex gap-2 justify-center items-center w-fit">
              <LightButton onClick={() => setPage("main")}>
                Back
              </LightButton>
              <LightButton onClick={handleSave}>Save Text</LightButton>
              <DarkButton
                onClick={() => {
                  setLocaleKey(0);
                  setEditPage("choose");
                }}
              >
                Choose Locale 1
              </DarkButton>
              <DarkButton
                onClick={() => {
                  setLocaleKey(1);
                  setEditPage("choose");
                }}
              >
                Choose Locale 2
              </DarkButton>
            </BCard>
          </div>
        </ACard>
      </Window>
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
