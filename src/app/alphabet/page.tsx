"use client";

import LightButton from "@/components/buttons/LightButton";
import { Letter, SupportedAlphabets } from "@/interfaces";
import { useEffect, useState } from "react";
import MemoryCard from "./MemoryCard";
import { Navbar } from "@/components/Navbar";
import { useTranslations } from "next-intl";

export default function Alphabet() {
  const t = useTranslations("alphabet");
  const [chosenAlphabet, setChosenAlphabet] =
    useState<SupportedAlphabets | null>(null);
  const [alphabetData, setAlphabetData] = useState<
    Record<SupportedAlphabets, Letter[] | null>
  >({
    japanese: null,
    english: null,
    esperanto: null,
    uyghur: null,
  });
  const [loadingState, setLoadingState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  useEffect(() => {
    if (chosenAlphabet && !alphabetData[chosenAlphabet]) {
      setLoadingState("loading");

      fetch("/alphabets/" + chosenAlphabet + ".json")
        .then((res) => {
          if (!res.ok) throw new Error("Network response was not ok");
          return res.json();
        })
        .then((obj) => {
          setAlphabetData((prev) => ({
            ...prev,
            [chosenAlphabet]: obj as Letter[],
          }));
          setLoadingState("success");
        })
        .catch(() => {
          setLoadingState("error");
        });
    }
  }, [chosenAlphabet, alphabetData]);

  useEffect(() => {
    if (loadingState === "error") {
      const timer = setTimeout(() => {
        setLoadingState("idle");
        setChosenAlphabet(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [loadingState]);

  if (!chosenAlphabet)
    return (
      <>
        <Navbar></Navbar>
        <div className="border border-gray-200 m-4 mt-4 flex flex-col justify-center items-center p-4 rounded-2xl gap-2">
          <span className="text-2xl md:text-3xl">{t("chooseCharacters")}</span>
          <div className="flex gap-1 flex-wrap">
            <LightButton onClick={() => setChosenAlphabet("japanese")}>
              {t("japanese")}
            </LightButton>
            <LightButton onClick={() => setChosenAlphabet("english")}>
              {t("english")}
            </LightButton>
            <LightButton onClick={() => setChosenAlphabet("uyghur")}>
              {t("uyghur")}
            </LightButton>
            <LightButton onClick={() => setChosenAlphabet("esperanto")}>
              {t("esperanto")}
            </LightButton>
          </div>
        </div>
      </>
    );
  if (loadingState === "loading") {
    return t("loading");
  }
  if (loadingState === "error") {
    return t("loadFailed");
  }
  if (loadingState === "success" && alphabetData[chosenAlphabet]) {
    return (
      <>
        <Navbar></Navbar>
        <MemoryCard
          alphabet={alphabetData[chosenAlphabet]}
          setChosenAlphabet={setChosenAlphabet}
        ></MemoryCard>
      </>
    );
  }
  return null;
}
