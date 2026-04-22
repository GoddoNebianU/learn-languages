import { Button } from "@/design-system/button"
import { IconButton } from "@/design-system/icon-button";
import { IMAGES } from "@/config/images";
import { Letter, SupportedAlphabets } from "@/lib/interfaces";
import {
  Dispatch,
  KeyboardEvent,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useTranslations } from "next-intl";

export function MemoryCard({
  alphabet,
  setChosenAlphabet,
}: {
  alphabet: Letter[];
  setChosenAlphabet: Dispatch<SetStateAction<SupportedAlphabets | null>>;
}) {
  const t = useTranslations("alphabet");
  const [index, setIndex] = useState(() => alphabet.length > 0 ? Math.floor(Math.random() * alphabet.length) : 0);
  const [more, setMore] = useState(false);
  const [ipaDisplay, setIPADisplay] = useState(true);
  const [letterDisplay, setLetterDisplay] = useState(true);

  const refresh = useCallback(() => {
    if (alphabet.length > 0) {
      setIndex(Math.floor(Math.random() * alphabet.length));
    }
  }, [alphabet.length]);

  useEffect(() => {
    const handleKeydown = (e: globalThis.KeyboardEvent) => {
      if (e.key === " ") refresh();
    };
    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  }, [refresh]);

  const letter = alphabet[index] || { letter: "", letter_name_ipa: "", letter_sound_ipa: "" };
  return (
    <div
      className="w-full flex justify-center items-center"
      onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => e.preventDefault()}
    >
      <div className="m-4 p-4 w-full md:w-[60dvw] flex-col rounded-lg shadow border-gray-200 border flex justify-center items-center">
        <div className="w-full flex justify-end items-center">
          <IconButton
            size={28}
            iconAlt="close"
            iconSrc={IMAGES.close}
            onClick={() => setChosenAlphabet(null)}
          ></IconButton>
        </div>
        <div className="flex flex-col gap-12 justify-center items-center">
          <span className="text-7xl md:text-9xl">
            {letterDisplay ? letter.letter : ""}
          </span>
          <span className="text-5xl md:text-7xl text-gray-400">
            {ipaDisplay ? letter.letter_sound_ipa : ""}
          </span>
        </div>
        <div className="flex flex-row mt-32 items-center justify-center gap-2">
          <IconButton
            size={28}
            iconAlt="refresh"
            iconSrc={IMAGES.refresh}
            onClick={refresh}
          ></IconButton>
          <IconButton
            size={28}
            iconAlt="more"
            iconSrc={IMAGES.more_horiz}
            onClick={() => setMore(!more)}
          ></IconButton>
          {more ? (
            <>
              <Button
                variant="light"
                className="w-20"
                onClick={() => {
                  setLetterDisplay(!letterDisplay);
                }}
              >
                {letterDisplay ? t("hideLetter") : t("showLetter")}
              </Button>
              <Button
                variant="light"
                className="w-20"
                onClick={() => {
                  setIPADisplay(!ipaDisplay);
                }}
              >
                {ipaDisplay ? t("hideIPA") : t("showIPA")}
              </Button>
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
}
