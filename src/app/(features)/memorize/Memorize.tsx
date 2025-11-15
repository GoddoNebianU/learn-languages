"use client";

import { Center } from "@/components/Center";
import { text_pair } from "../../../../generated/prisma/browser";
import Container from "@/components/cards/Container";
import { useState } from "react";
import LightButton from "@/components/buttons/LightButton";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { getTTSAudioUrl } from "@/lib/tts";
import { VOICES } from "@/config/locales";

interface MemorizeProps {
  textPairs: text_pair[];
}

const Memorize: React.FC<MemorizeProps> = ({ textPairs }) => {
  const [reverse, setReverse] = useState(false);
  const [dictation, setDictation] = useState(false);
  const [index, setIndex] = useState(0);
  const [show, setShow] = useState<"question" | "answer">("question");
  const { load, play } = useAudioPlayer();

  return (
    <Center>
      <Container className="p-6 flex flex-col gap-8 h-96 justify-center items-center">
        {(textPairs.length > 0 && (
          <>
            <div className="h-36 flex flex-col gap-2 justify-start items-center font-serif text-3xl">
              <div className="text-sm text-gray-500">
                {index + 1}/{textPairs.length}
              </div>
              {dictation ? (
                show === "question" ? (
                  ""
                ) : (
                  <>
                    <div>
                      {reverse
                        ? textPairs[index].text2
                        : textPairs[index].text1}
                    </div>
                    <div>
                      {reverse
                        ? textPairs[index].text1
                        : textPairs[index].text2}
                    </div>
                  </>
                )
              ) : (
                <>
                  <div>
                    {reverse ? textPairs[index].text2 : textPairs[index].text1}
                  </div>
                  <div>
                    {show === "answer"
                      ? reverse
                        ? textPairs[index].text1
                        : textPairs[index].text2
                      : ""}
                  </div>
                </>
              )}
            </div>
            <div className="flex flex-row gap-2 items-center justify-center">
              <LightButton
                className="w-32"
                onClick={async () => {
                  if (show === "answer") {
                    const newIndex = (index + 1) % textPairs.length;
                    setIndex(newIndex);
                    if (dictation)
                      getTTSAudioUrl(
                        textPairs[newIndex][reverse ? "text2" : "text1"],
                        VOICES.find(
                          (v) =>
                            v.locale ===
                            textPairs[newIndex][
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
                {show === "question" ? "Show Answer" : "Next"}
              </LightButton>
              <LightButton
                onClick={() => {
                  setReverse(!reverse);
                }}
                selected={reverse}
              >
                Reverse
              </LightButton>
              <LightButton
                onClick={() => {
                  setDictation(!dictation);
                }}
                selected={dictation}
              >
                Dictation
              </LightButton>
            </div>
          </>
        )) || <p>No text pairs available</p>}
      </Container>
    </Center>
  );
};

export default Memorize;
