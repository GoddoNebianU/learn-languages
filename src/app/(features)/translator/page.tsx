"use client";

import { LightButton } from "@/components/ui/buttons";
import { IconClick } from "@/components/ui/buttons";
import IMAGES from "@/config/images";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { actionTranslateText } from "@/modules/translator";
import { toast } from "sonner";
import { getTTSUrl, TTS_SUPPORTED_LANGUAGES } from "@/lib/bigmodel/tts";
import { TSharedTranslationResult } from "@/shared";

export default function TranslatorPage() {
  const t = useTranslations("translator");

  const taref = useRef<HTMLTextAreaElement>(null);
  const [targetLanguage, setTargetLanguage] = useState<string>("Chinese");
  const [translationResult, setTranslationResult] = useState<TSharedTranslationResult | null>(null);
  const [needIpa, setNeedIpa] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [lastTranslation, setLastTranslation] = useState<{
    sourceText: string;
    targetLanguage: string;
  } | null>(null);
  const { load, play } = useAudioPlayer();
  const lastTTS = useRef({
    text: "",
    url: "",
  });

  const tts = async (text: string, locale: string) => {
    if (lastTTS.current.text !== text) {
      try {
        // Map language name to TTS format
        let theLanguage = locale.toLowerCase().replace(/[^a-z]/g, '').replace(/^./, match => match.toUpperCase());

        // Check if language is in TTS supported list
        const supportedLanguages: TTS_SUPPORTED_LANGUAGES[] = [
          "Auto", "Chinese", "English", "German", "Italian", "Portuguese",
          "Spanish", "Japanese", "Korean", "French", "Russian"
        ];

        if (!supportedLanguages.includes(theLanguage as TTS_SUPPORTED_LANGUAGES)) {
          theLanguage = "Auto";
        }

        const url = await getTTSUrl(text, theLanguage as TTS_SUPPORTED_LANGUAGES);
        await load(url);
        await play();
        lastTTS.current.text = text;
        lastTTS.current.url = url;
      } catch (error) {
        toast.error("Failed to generate audio");
      }
    }
  };

  const translate = async () => {
    if (!taref.current || processing) return;

    setProcessing(true);

    const sourceText = taref.current.value;

    // 判断是否需要强制重新翻译
    // 只有当源文本和目标语言都与上次相同时，才强制重新翻译
    const forceRetranslate =
      lastTranslation?.sourceText === sourceText &&
      lastTranslation?.targetLanguage === targetLanguage;

    try {
      const result = await actionTranslateText({
        sourceText,
        targetLanguage,
        forceRetranslate,
        needIpa,
      });

      if (result.success && result.data) {
        setTranslationResult(result.data);
        setLastTranslation({
          sourceText,
          targetLanguage,
        });
      } else {
        toast.error(result.message || "翻译失败，请重试");
      }
    } catch (error) {
      toast.error("翻译失败，请重试");
      console.error("翻译错误:", error);
    } finally {
      setProcessing(false);
    }
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
              {translationResult?.sourceIpa || ""}
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
                  tts(t, translationResult?.sourceLanguage || "");
                }}
              ></IconClick>
            </div>
          </div>
          <div className="option1 w-full flex flex-row justify-between items-center">
            <span>{t("detectLanguage")}</span>
            <LightButton
              selected={needIpa}
              onClick={() => setNeedIpa((prev) => !prev)}
            >
              {t("generateIPA")}
            </LightButton>
          </div>
        </div>

        {/* Card Component - Right Side */}
        <div className="w-full md:w-1/2 flex flex-col-reverse gap-2">
          {/* ICard2 Component */}
          <div className="bg-gray-100 rounded-2xl w-full h-64 p-2">
            <div className="h-2/3 w-full overflow-y-auto">{translationResult?.translatedText || ""}</div>
            <div className="ipa w-full h-1/6 overflow-y-auto text-gray-600">
              {translationResult?.targetIpa || ""}
            </div>
            <div className="h-1/6 w-full flex justify-end items-center">
              <IconClick
                src={IMAGES.copy_all}
                alt="copy"
                onClick={async () => {
                  await navigator.clipboard.writeText(translationResult?.translatedText || "");
                }}
              ></IconClick>
              <IconClick
                src={IMAGES.play_arrow}
                alt="play"
                onClick={() => {
                  if (!translationResult) return;
                  tts(
                    translationResult.translatedText,
                    translationResult.targetLanguage,
                  );
                }}
              ></IconClick>
            </div>
          </div>
          <div className="option2 w-full flex gap-1 items-center flex-wrap">
            <span>{t("translateInto")}</span>
            <LightButton
              selected={targetLanguage === "Chinese"}
              onClick={() => setTargetLanguage("Chinese")}
            >
              {t("chinese")}
            </LightButton>
            <LightButton
              selected={targetLanguage === "English"}
              onClick={() => setTargetLanguage("English")}
            >
              {t("english")}
            </LightButton>
            <LightButton
              selected={targetLanguage === "Italian"}
              onClick={() => setTargetLanguage("Italian")}
            >
              {t("italian")}
            </LightButton>
            <LightButton
              selected={!["Chinese", "English", "Italian"].includes(targetLanguage)}
              onClick={() => {
                const newLang = prompt(t("enterLanguage"));
                if (newLang) {
                  setTargetLanguage(newLang);
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
    </>
  );
}
