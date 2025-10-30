import LightButton from "@/components/buttons/LightButton";
import Window from "@/components/Window";
import { WordData } from "./page";
import { Dispatch, SetStateAction, useState } from "react";

interface Props {
  wordData: WordData;
  setPage: Dispatch<SetStateAction<"start" | "main" | "edit">>;
}

export default function Start({ wordData, setPage }: Props) {
  const [display, setDisplay] = useState<"ask" | "show">("ask");
  const [wordPair, setWordPair] = useState(
    wordData.wordPairs[Math.floor(Math.random() * wordData.wordPairs.length)],
  );
  const show = () => {
    setDisplay("show");
  };
  const next = () => {
    setDisplay("ask");
    setWordPair(
      wordData.wordPairs[Math.floor(Math.random() * wordData.wordPairs.length)],
    );
  };
  return (
    <Window>
      <div className="flex-col flex items-center h-96 w-[66dvw]">
        <div className="flex-1 w-full p-4 gap-4 flex flex-col text-5xl font-serif">
          <div className="p-4 w-full border border-white rounded shadow">
            {wordPair[0]}
          </div>
          {display === "show" && (
            <div className="p-4 w-full flex-1 border border-white rounded shadow">
              {wordPair[1]}
            </div>
          )}
        </div>
        <div className="w-full flex items-center justify-center">
          <div className="flex gap-2 justify-center items-center w-fit">
            {display === "ask" ? (
              <LightButton onClick={show}>Show</LightButton>
            ) : (
              <LightButton onClick={next}>Next</LightButton>
            )}
            <LightButton onClick={() => setPage("main")}>Exit</LightButton>
          </div>
        </div>
      </div>
    </Window>
  );
}
