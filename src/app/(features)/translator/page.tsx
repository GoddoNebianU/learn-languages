"use client";

import { LightButton, PrimaryButton, IconClick } from "@/design-system/base/button";
import { Select } from "@/design-system/base/select";
import { IMAGES } from "@/config/images";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { actionTranslateText } from "@/modules/translator/translator-action";
import { toast } from "sonner";
import { getTTSUrl, TTS_SUPPORTED_LANGUAGES } from "@/lib/bigmodel/tts";
import { TSharedTranslationResult } from "@/shared/translator-type";

const SOURCE_LANGUAGES = [
  { value: "Auto", labelKey: "auto" },
  { value: "Chinese", labelKey: "chinese" },
  { value: "English", labelKey: "english" },
  { value: "Japanese", labelKey: "japanese" },
  { value: "Korean", labelKey: "korean" },
  { value: "French", labelKey: "french" },
  { value: "German", labelKey: "german" },
  { value: "Italian", labelKey: "italian" },
  { value: "Spanish", labelKey: "spanish" },
  { value: "Portuguese", labelKey: "portuguese" },
  { value: "Russian", labelKey: "russian" },
] as const;

const TARGET_LANGUAGES = [
  { value: "Chinese", labelKey: "chinese" },
  { value: "English", labelKey: "english" },
  { value: "Japanese", labelKey: "japanese" },
  { value: "Korean", labelKey: "korean" },
  { value: "French", labelKey: "french" },
  { value: "German", labelKey: "german" },
  { value: "Italian", labelKey: "italian" },
  { value: "Spanish", labelKey: "spanish" },
  { value: "Portuguese", labelKey: "portuguese" },
  { value: "Russian", labelKey: "russian" },
] as const;

export default function TranslatorPage() {
  const t = useTranslations("translator");

  const taref = useRef<HTMLTextAreaElement>(null);
  const [sourceLanguage, setSourceLanguage] = useState<string>("Auto");
  const [targetLanguage, setTargetLanguage] = useState<string>("Chinese");
  const [translationResult, setTranslationResult] = useState<TSharedTranslationResult | null>(null);
  const [needIpa, setNeedIpa] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [lastTranslation, setLastTranslation] = useState<{
    sourceText: string;
    sourceLanguage: string;
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
    // 只有当源文本、源语言和目标语言都与上次相同时，才强制重新翻译
    const forceRetranslate =
      lastTranslation?.sourceText === sourceText &&
      lastTranslation?.sourceLanguage === sourceLanguage &&
      lastTranslation?.targetLanguage === targetLanguage;

    try {
      const result = await actionTranslateText({
        sourceText,
        targetLanguage,
        forceRetranslate,
        needIpa,
        sourceLanguage: sourceLanguage === "Auto" ? undefined : sourceLanguage,
      });

      if (result.success && result.data) {
        setTranslationResult(result.data);
        setLastTranslation({
          sourceText,
          sourceLanguage,
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
    <div className="min-h-[calc(100vh-64px)] bg-white">
      {/* TCard Component */}
      <div className="w-screen flex flex-col md:flex-row md:justify-between gap-2 p-2">
        {/* Card Component - Left Side */}
        <div className="w-full md:w-1/2 flex flex-col-reverse gap-2">
          {/* ICard1 Component */}
          <div className="border border-gray-200 rounded-lg w-full h-64 p-2">
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
          <div className="option1 w-full flex gap-1 items-center overflow-x-auto">
            <span className="shrink-0">{t("sourceLanguage")}</span>
            <LightButton
              selected={sourceLanguage === "Auto"}
              onClick={() => setSourceLanguage("Auto")}
              className="shrink-0 hidden lg:inline-flex"
            >
              {t("auto")}
            </LightButton>
            <LightButton
              selected={sourceLanguage === "Chinese"}
              onClick={() => setSourceLanguage("Chinese")}
              className="shrink-0 hidden lg:inline-flex"
            >
              {t("chinese")}
            </LightButton>
            <LightButton
              selected={sourceLanguage === "English"}
              onClick={() => setSourceLanguage("English")}
              className="shrink-0 hidden xl:inline-flex"
            >
              {t("english")}
            </LightButton>
            <Select
              value={sourceLanguage}
              onChange={(e) => setSourceLanguage(e.target.value)}
              variant="light"
              size="sm"
              className="w-auto min-w-[100px] shrink-0"
            >
              {SOURCE_LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {t(lang.labelKey)}
                </option>
              ))}
            </Select>
            <div className="flex-1"></div>
            <LightButton
              selected={needIpa}
              onClick={() => setNeedIpa((prev) => !prev)}
              className="shrink-0"
            >
              {t("generateIPA")}
            </LightButton>
          </div>
        </div>

        {/* Card Component - Right Side */}
        <div className="w-full md:w-1/2 flex flex-col-reverse gap-2">
          {/* ICard2 Component */}
          <div className="bg-gray-100 rounded-lg w-full h-64 p-2">
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
          <div className="option2 w-full flex gap-1 items-center overflow-x-auto">
            <span className="shrink-0">{t("translateInto")}</span>
            <LightButton
              selected={targetLanguage === "Chinese"}
              onClick={() => setTargetLanguage("Chinese")}
              className="shrink-0 hidden lg:inline-flex"
            >
              {t("chinese")}
            </LightButton>
            <LightButton
              selected={targetLanguage === "English"}
              onClick={() => setTargetLanguage("English")}
              className="shrink-0 hidden lg:inline-flex"
            >
              {t("english")}
            </LightButton>
            <LightButton
              selected={targetLanguage === "Japanese"}
              onClick={() => setTargetLanguage("Japanese")}
              className="shrink-0 hidden xl:inline-flex"
            >
              {t("japanese")}
            </LightButton>
            <Select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              variant="light"
              size="sm"
              className="w-auto min-w-[100px] shrink-0"
            >
              {TARGET_LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {t(lang.labelKey)}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/* TranslateButton Component */}
      <div className="w-screen flex justify-center items-center">
        <PrimaryButton
          onClick={translate}
          disabled={processing}
          size="lg"
          className="text-xl"
        >
          {t("translate")}
        </PrimaryButton>
      </div>
    </div>
  );
}
