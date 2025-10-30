import LightButton from "@/components/buttons/LightButton";
import { WordData } from "@/interfaces";
import { Dispatch, SetStateAction, useState } from "react";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { getTTSAudioUrl } from "@/utils";
import { VOICES } from "@/config/locales";
import NavbarCenterWrapper from "@/components/NavbarCenterWrapper";

interface WordBoardProps {
  children: React.ReactNode;
}
function WordBoard({ children }: WordBoardProps) {
  return (
    <div className="text-nowrap w-full h-36 border border-white rounded flex justify-center items-center text-4xl md:text-6xl font-serif overflow-x-auto">
      {children}
    </div>
  );
}

interface Props {
  wordData: WordData;
  setPage: Dispatch<SetStateAction<"start" | "main" | "edit">>;
}
export default function Start({ wordData, setPage }: Props) {
  const [display, setDisplay] = useState<"ask" | "show">("ask");
  const [wordPair, setWordPair] = useState(
    wordData.wordPairs[Math.floor(Math.random() * wordData.wordPairs.length)],
  );
  const [reverse, setReverse] = useState(false);
  const [dictation, setDictation] = useState(false);
  const { load, play } = useAudioPlayer();
  const show = () => {
    setDisplay("show");
  };
  const next = async () => {
    setDisplay("ask");
    const newWordPair =
      wordData.wordPairs[Math.floor(Math.random() * wordData.wordPairs.length)];
    setWordPair(newWordPair);
    if (dictation)
      await load(
        await getTTSAudioUrl(
          newWordPair[reverse ? 1 : 0],
          VOICES.find((v) => v.locale === wordData.locales[reverse ? 1 : 0])!
            .short_name,
        ),
      ).then(play);
  };
  return (
    <NavbarCenterWrapper className="bg-gray-100">
      <div className="flex-col flex items-center h-96">
        <div className="flex-1 w-[95dvw] md:w-fit p-4 gap-4 flex flex-col overflow-x-auto">
          {dictation ? (
            <>
              {display === "show" && (
                <>
                  <WordBoard>{wordPair[reverse ? 1 : 0]}</WordBoard>
                  <WordBoard>{wordPair[reverse ? 0 : 1]}</WordBoard>
                </>
              )}
            </>
          ) : (
            <>
              <WordBoard>{wordPair[reverse ? 1 : 0]}</WordBoard>
              {display === "show" && (
                <WordBoard>{wordPair[reverse ? 0 : 1]}</WordBoard>
              )}
            </>
          )}
        </div>
        <div className="w-full flex items-center justify-center">
          <div className="flex gap-2 justify-center items-center w-fit font-mono flex-wrap">
            {display === "ask" ? (
              <LightButton onClick={show}>Show</LightButton>
            ) : (
              <LightButton onClick={next}>Next</LightButton>
            )}
            <LightButton
              onClick={() => setReverse(!reverse)}
              selected={reverse}
            >
              Reverse
            </LightButton>
            <LightButton
              onClick={() => setDictation(!dictation)}
              selected={dictation}
            >
              Dictation
            </LightButton>
            <LightButton onClick={() => setPage("main")}>Exit</LightButton>
          </div>
        </div>
      </div>
    </NavbarCenterWrapper>
  );
}
