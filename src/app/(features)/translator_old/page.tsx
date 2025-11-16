"use client";

import LightButton from "@/components/buttons/LightButton";
import IconClick from "@/components/IconClick";
import IMAGES from "@/config/images";
import { VOICES } from "@/config/locales";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { TranslationHistorySchema } from "@/lib/interfaces";
import { tlsoPush, tlso } from "@/lib/localStorageOperators";
import { getTTSAudioUrl } from "@/lib/tts";
import { letsFetch, shallowEqual } from "@/lib/utils";
import { Plus, Trash } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import z from "zod";
import AddToFolder from "./AddToFolder";

export default function TranslatorPage() {
  const t = useTranslations("translator");

  const taref = useRef<HTMLTextAreaElement>(null);
  const [lang, setLang] = useState<string>("chinese");
  const [tresult, setTresult] = useState<string>("");
  const [genIpa, setGenIpa] = useState(true);
  const [ipaTexts, setIpaTexts] = useState(["", ""]);
  const [processing, setProcessing] = useState(false);
  const { load, play } = useAudioPlayer();
  const [history, setHistory] = useState<
    z.infer<typeof TranslationHistorySchema>[]
  >(tlso.get());
  const [showAddToFolder, setShowAddToFolder] = useState(false);
  const [addToFolderItem, setAddToFolderItem] = useState<z.infer<
    typeof TranslationHistorySchema
  > | null>(null);

  const lastTTS = useRef({
    text: "",
    url: "",
  });

  const tts = async (text: string, locale: string) => {
    if (lastTTS.current.text !== text) {
      const url = await getTTSAudioUrl(
        text,
        VOICES.find((v) => v.locale === locale)!.short_name,
      );
      await load(url);
      lastTTS.current.text = text;
      lastTTS.current.url = url;
    }
    play();
  };

  const translate = async () => {
    if (processing) return;
    setProcessing(true);

    if (!taref.current) return;
    const text = taref.current.value;

    const newItem: {
      text1: string | null;
      text2: string | null;
      locale1: string | null;
      locale2: string | null;
    } = {
      text1: text,
      text2: null,
      locale1: null,
      locale2: null,
    };

    const checkUpdateLocalStorage = (item: typeof newItem) => {
      if (item.text1 && item.text2 && item.locale1 && item.locale2) {
        setHistory(tlsoPush(item as z.infer<typeof TranslationHistorySchema>));
      }
    };
    const innerStates = {
      text2: false,
      ipa1: !genIpa,
      ipa2: !genIpa,
    };
    const checkUpdateProcessStates = () => {
      if (innerStates.ipa1 && innerStates.ipa2 && innerStates.text2)
        setProcessing(false);
    };
    const updateState = (stateName: keyof typeof innerStates) => () => {
      innerStates[stateName] = true;
      checkUpdateLocalStorage(newItem);
      checkUpdateProcessStates();
    };

    // Fetch locale for text1
    letsFetch(
      `/api/v1/locale?text=${encodeURIComponent(text)}`,
      (locale: string) => {
        newItem.locale1 = locale;
      },
      console.log,
      () => {},
    );

    if (genIpa)
      // Fetch IPA for text1
      letsFetch(
        `/api/v1/ipa?text=${encodeURIComponent(text)}`,
        (ipa: string) => setIpaTexts((prev) => [ipa, prev[1]]),
        console.log,
        updateState("ipa1"),
      );
    // Fetch translation for text2
    letsFetch(
      `/api/v1/translate?text=${encodeURIComponent(text)}&lang=${encodeURIComponent(lang)}`,
      (text2) => {
        setTresult(text2);
        newItem.text2 = text2;
        if (genIpa)
          // Fetch IPA for text2
          letsFetch(
            `/api/v1/ipa?text=${encodeURIComponent(text2)}`,
            (ipa: string) => setIpaTexts((prev) => [prev[0], ipa]),
            console.log,
            updateState("ipa2"),
          );
        // Fetch locale for text2
        letsFetch(
          `/api/v1/locale?text=${encodeURIComponent(text2)}`,
          (locale: string) => {
            newItem.locale2 = locale;
          },
          console.log,
          () => {},
        );
      },
      console.log,
      updateState("text2"),
    );
  };

  return (
    <>
      {/* TCard Component */}
      <div className="w-screen flex flex-col md:flex-row md:justify-between gap-2 p-2">
        {/* Card Component - Left Side */}
        <div className="w-full md:w-1/2 flex flex-col-reverse gap-2">
          {/* ICard1 Component */}
          <div className="border border-gray-200 rounded-2xl w-full h-64 p-2">
            <textarea
              className="resize-none h-8/12 w-full focus:outline-0"
              ref={taref}
              onKeyDown={(e) => {
                if (e.ctrlKey && e.key === "Enter") translate();
              }}
            ></textarea>
            <div className="ipa w-full h-2/12 overflow-auto text-gray-600">
              {ipaTexts[0]}
            </div>
            <div className="h-2/12 w-full flex justify-end items-center">
              <IconClick
                src={IMAGES.copy_all}
                alt="copy"
                onClick={async () => {
                  await navigator.clipboard.writeText(
                    taref.current?.value || "",
                  );
                }}
              ></IconClick>
              <IconClick
                src={IMAGES.play_arrow}
                alt="play"
                onClick={() => {
                  const t = taref.current?.value;
                  if (!t) return;
                  tts(t, tlso.get().find((v) => v.text1 === t)?.locale1 || "");
                }}
              ></IconClick>
            </div>
          </div>
          <div className="option1 w-full flex flex-row justify-between items-center">
            <span>{t("detectLanguage")}</span>
            <LightButton
              selected={genIpa}
              onClick={() => setGenIpa((prev) => !prev)}
            >
              {t("generateIPA")}
            </LightButton>
          </div>
        </div>

        {/* Card Component - Right Side */}
        <div className="w-full md:w-1/2 flex flex-col-reverse gap-2">
          {/* ICard2 Component */}
          <div className="bg-gray-100 rounded-2xl w-full h-64 p-2">
            <div className="h-2/3 w-full overflow-y-auto">{tresult}</div>
            <div className="ipa w-full h-1/6 overflow-y-auto text-gray-600">
              {ipaTexts[1]}
            </div>
            <div className="h-1/6 w-full flex justify-end items-center">
              <IconClick
                src={IMAGES.copy_all}
                alt="copy"
                onClick={async () => {
                  await navigator.clipboard.writeText(tresult);
                }}
              ></IconClick>
              <IconClick
                src={IMAGES.play_arrow}
                alt="play"
                onClick={() => {
                  tts(
                    tresult,
                    tlso.get().find((v) => v.text2 === tresult)?.locale2 || "",
                  );
                }}
              ></IconClick>
            </div>
          </div>
          <div className="option2 w-full flex gap-1 items-center flex-wrap">
            <span>{t("translateInto")}</span>
            <LightButton
              selected={lang === "chinese"}
              onClick={() => setLang("chinese")}
            >
              {t("chinese")}
            </LightButton>
            <LightButton
              selected={lang === "english"}
              onClick={() => setLang("english")}
            >
              {t("english")}
            </LightButton>
            <LightButton
              selected={lang === "italian"}
              onClick={() => setLang("italian")}
            >
              {t("italian")}
            </LightButton>
            <LightButton
              selected={!["chinese", "english", "italian"].includes(lang)}
              onClick={() => {
                const newLang = prompt(t("enterLanguage"));
                if (newLang) {
                  setLang(newLang);
                }
              }}
            >
              {t("other")}
            </LightButton>
          </div>
        </div>
      </div>

      {/* TranslateButton Component */}
      <div className="w-screen flex justify-center items-center">
        <button
          className={`duration-150 ease-in text-xl font-extrabold border rounded-4xl p-3 border-gray-200 h-16 ${processing ? "bg-gray-200" : "bg-white hover:bg-gray-200 hover:cursor-pointer"}`}
          onClick={translate}
        >
          {t("translate")}
        </button>
      </div>
      {history.length > 0 && (
        <div className="m-6 flex flex-col items-center">
          <h1 className="text-2xl font-light">{t("history")}</h1>
          <div className="border border-gray-200 rounded-2xl m-4">
            {history.toReversed().map((item, index) => (
              <div key={index}>
                <div className="border-b border-gray-200 p-2 group hover:bg-gray-50 flex gap-2 flex-row justify-between items-start">
                  <div className="flex-1 flex flex-col">
                    <p className="text-sm font-light">{item.text1}</p>
                    <p className="text-sm font-light">{item.text2}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowAddToFolder(true);
                        setAddToFolderItem(item);
                      }}
                      className="hover:bg-gray-200 hover:cursor-pointer rounded-4xl border border-gray-200 w-8 h-8 flex justify-center items-center"
                    >
                      <Plus />
                    </button>
                    <button
                      onClick={() => {
                        setHistory(
                          tlso.set(
                            tlso.get().filter((v) => !shallowEqual(v, item)),
                          ) || [],
                        );
                      }}
                      className="hover:bg-gray-200 hover:cursor-pointer rounded-4xl border border-gray-200 w-8 h-8 flex justify-center items-center"
                    >
                      <Trash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {showAddToFolder && (
            <AddToFolder setShow={setShowAddToFolder} item={addToFolderItem!} />
          )}
        </div>
      )}
    </>
  );
}
