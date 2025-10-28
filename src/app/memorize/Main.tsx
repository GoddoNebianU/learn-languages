import LightButton from "@/components/buttons/LightButton";
import ACard from "@/components/cards/ACard";
import BCard from "@/components/cards/BCard";
import Window from "@/components/Window";
import { WordData } from "./page";
import { Dispatch, SetStateAction } from "react";

interface Props {
  wordData: WordData;
  setPage: Dispatch<SetStateAction<"start" | "main" | "edit">>;
}

export default function Main({ wordData, setPage: setPage }: Props) {
  return (
    <Window>
      <ACard className="flex-col flex">
        <h1 className="text-center font-extrabold text-4xl text-gray-800 m-2 mb-4">
          Memorize
        </h1>
        <div className="flex-1 font-serif text-2xl w-full h-full text-gray-800">
          <BCard>
            <p>locale 1 {wordData.locales[0]}</p>
            <p>locale 2 {wordData.locales[1]}</p>
            <p>Total Words: {wordData.wordPairs.length}</p>
          </BCard>
        </div>
        <div className="w-full flex items-center justify-center">
          <BCard className="flex gap-2 justify-center items-center w-fit">
            <LightButton onClick={() => setPage("start")}>
              Start
            </LightButton>
            <LightButton>Load</LightButton>
            <LightButton>Save</LightButton>
            <LightButton onClick={() => setPage("edit")}>Edit</LightButton>
          </BCard>
        </div>
      </ACard>
    </Window>
  );
}
