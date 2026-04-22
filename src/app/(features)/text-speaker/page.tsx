"use client";

import { Button, IconClick } from "@/design-system/base/button";
import { Input } from "@/design-system/base/input";
import { Textarea } from "@/design-system/base/textarea";
import { IMAGES } from "@/config/images";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import {
  TextSpeakerArraySchema,
  TextSpeakerItemSchema,
} from "@/lib/interfaces";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import z from "zod";
import { SaveList } from "./SaveList";

import { useTranslations } from "next-intl";
import { getLocalStorageOperator } from "@/lib/browser/localStorageOperators";
import { genIPA, genLanguage } from "@/modules/translator/translator-action";
import { PageLayout } from "@/components/ui/PageLayout";
import { getTTSUrl, TTS_SUPPORTED_LANGUAGES } from "@/lib/bigmodel/tts";

const TTS_LANGUAGES = [
  { value: "Auto", label: "auto" },
  { value: "Chinese", label: "chinese" },
  { value: "English", label: "english" },
  { value: "Japanese", label: "japanese" },
  { value: "Korean", label: "korean" },
  { value: "French", label: "french" },
  { value: "German", label: "german" },
  { value: "Italian", label: "italian" },
  { value: "Spanish", label: "spanish" },
  { value: "Portuguese", label: "portuguese" },
  { value: "Russian", label: "russian" },
] as const;

type TTSLabel = typeof TTS_LANGUAGES[number]["label"];

function getLanguageLabel(t: (key: string) => string, label: TTSLabel): string {
  switch (label) {
    case "auto": return t("languages.auto");
    case "chinese": return t("languages.chinese");
    case "english": return t("languages.english");
    case "japanese": return t("languages.japanese");
    case "korean": return t("languages.korean");
    case "french": return t("languages.french");
    case "german": return t("languages.german");
    case "italian": return t("languages.italian");
    case "spanish": return t("languages.spanish");
    case "portuguese": return t("languages.portuguese");
    case "russian": return t("languages.russian");
  }
}

export default function TextSpeakerPage() {
  const t = useTranslations("text_speaker");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showSpeedAdjust, setShowSpeedAdjust] = useState(false);
  const [showSaveList, setShowSaveList] = useState(false);
  const [saving, setSaving] = useState(false);
  const [ipaEnabled, setIPAEnabled] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [pause, setPause] = useState(true);
  const [autopause, setAutopause] = useState(true);
  const textRef = useRef("");
  const [language, setLanguage] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("Auto");
  const [customLanguage, setCustomLanguage] = useState<string>("");
  const [ipa, setIPA] = useState<string>("");
  const objurlRef = useRef<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const { play, stop, load, audioRef } = useAudioPlayer();

  const { get: getFromLocalStorage, set: setIntoLocalStorage } =
    getLocalStorageOperator<typeof TextSpeakerArraySchema>(
      "text-speaker",
      TextSpeakerArraySchema,
    );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      if (autopause) {
        setPause(true);
      } else if (objurlRef.current) {
        load(objurlRef.current);
        play();
      }
    };
    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("ended", handleEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioRef, autopause]);

  const speak = async () => {
    if (processing) return;
    setProcessing(true);

    if (ipa.length === 0 && ipaEnabled && textRef.current.length !== 0) {
      const params = new URLSearchParams({
        text: textRef.current,
      });
      fetch(`/api/ipa?${params}`)
        .then((res) => res.json())
        .then((data) => {
          setIPA(data.ipa);
        })
        .catch((e) => {
          console.error(t("ipaGenerationFailed"), e);
          setIPA("");
        });
    }

    if (pause) {
      // 如果没在读
      if (textRef.current.length === 0) {
        // 没文本咋读
      } else {
        setPause(false);

        if (objurlRef.current) {
          // 之前有播放
          load(objurlRef.current);
          play();
        } else {
          // 第一次播放
          try {
            let theLanguage: string;
            
            if (customLanguage.trim()) {
              theLanguage = customLanguage.trim();
            } else if (selectedLanguage !== "Auto") {
              theLanguage = selectedLanguage;
            } else if (language) {
              theLanguage = language;
            } else {
              const tmp_language = await genLanguage(textRef.current.slice(0, 30));
              setLanguage(tmp_language);
              theLanguage = tmp_language;
            }

            theLanguage = theLanguage.toLowerCase().replace(/[^a-z]/g, '').replace(/^./, match => match.toUpperCase());

            const supportedLanguages: TTS_SUPPORTED_LANGUAGES[] = [
              "Auto", "Chinese", "English", "German", "Italian", "Portuguese",
              "Spanish", "Japanese", "Korean", "French", "Russian"
            ];

            if (!supportedLanguages.includes(theLanguage as TTS_SUPPORTED_LANGUAGES)) {
              theLanguage = "Auto";
            }

            objurlRef.current = await getTTSUrl(
              textRef.current,
              theLanguage as TTS_SUPPORTED_LANGUAGES
            );
            if (!objurlRef.current) {
              throw new Error("TTS returned no audio URL");
            }
            load(objurlRef.current);
            play();
          } catch (e) {
            console.error(t("audioPlaybackFailed"), e);
            setPause(true);
            setLanguage(null);
            setProcessing(false);
          }
        }
      }
    } else {
      // 如果在读就暂停
      setPause(true);
      stop();
    }

    setProcessing(false);
  };

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    textRef.current = e.target.value.trim();
    setLanguage(null);
    setSelectedLanguage("Auto");
    setCustomLanguage("");
    setIPA("");
    if (objurlRef.current) URL.revokeObjectURL(objurlRef.current);
    objurlRef.current = null;
    stop();
    setPause(true);
  };

  const letMeSetSpeed = (new_speed: number) => {
    return () => {
      setSpeed(new_speed);
      if (objurlRef.current) URL.revokeObjectURL(objurlRef.current);
      objurlRef.current = null;
      stop();
      setPause(true);
    };
  };

  const handleUseItem = (item: z.infer<typeof TextSpeakerItemSchema>) => {
    if (textareaRef.current) textareaRef.current.value = item.text;
    textRef.current = item.text;
    setLanguage(item.language);
    setIPA(item.ipa || "");
    if (objurlRef.current) URL.revokeObjectURL(objurlRef.current);
    objurlRef.current = null;
    stop();
    setPause(true);
  };

  const save = async () => {
    if (saving) return;
    if (textRef.current.length === 0) return;

    setSaving(true);

    try {
      let theLanguage = language;
      if (!theLanguage) {
        const tmp_language = await genLanguage(textRef.current.slice(0, 30));
        setLanguage(tmp_language);
        theLanguage = tmp_language;
      }

      let theIPA = ipa;
      if (ipa.length === 0 && ipaEnabled) {
        const tmp_ipa = await genIPA(textRef.current);
        setIPA(tmp_ipa);
        theIPA = tmp_ipa;
      }

      const save = getFromLocalStorage() ?? [];
      const oldIndex = save.findIndex((v) => v.text === textRef.current);
      if (oldIndex !== -1) {
        const oldItem = save[oldIndex];
        if (theIPA) {
          if (!oldItem.ipa || oldItem.ipa !== theIPA) {
            oldItem.ipa = theIPA;
            setIntoLocalStorage(save);
          }
        }
      } else if (theIPA.length === 0) {
        save.push({
          text: textRef.current,
          language: theLanguage as string,
        });
      } else {
        save.push({
          text: textRef.current,
          language: theLanguage as string,
          ipa: theIPA,
        });
      }
      setIntoLocalStorage(save);
    } catch (e) {
      console.error(t("saveFailed"), e);
      setLanguage(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageLayout className="items-start py-4">
      {/* 文本输入区域 */}
      <div
        className="border border-gray-200 rounded-lg"
        style={{ fontFamily: "Times New Roman, serif" }}
      >
        {/* 文本输入框 */}
        <Textarea
          variant="bordered"
          className="text-2xl min-h-64"
          onChange={handleInputChange}
          ref={textareaRef}
        />
        {/* IPA 显示区域 */}
        {(ipa.length !== 0 && (
          <div className="overflow-auto text-gray-600 h-18 border-gray-200 border-b px-4">
            {ipa}
          </div>
        )) || <div className="h-18"></div>}

        {/* 控制按钮区域 */}
        <div className="p-4 relative w-full flex flex-row flex-wrap gap-2 justify-center items-center">
          {/* 速度调节面板 */}
          {showSpeedAdjust && (
            <div className="bg-white p-6 rounded-lg border-gray-200 border-2 shadow-2xl absolute left-1/2 -translate-x-1/2 -translate-y-full -top-4 flex flex-row flex-wrap gap-2 justify-center items-center z-10">
              <IconClick
                size="lg"
                onClick={letMeSetSpeed(0.5)}
                src={IMAGES.speed_0_5x}
                alt="0.5x"
                className={speed === 0.5 ? "bg-gray-200" : ""}
              ></IconClick>
              <IconClick
                size="lg"
                onClick={letMeSetSpeed(0.7)}
                src={IMAGES.speed_0_7x}
                alt="0.7x"
                className={speed === 0.7 ? "bg-gray-200" : ""}
              ></IconClick>
              <IconClick
                size="lg"
                onClick={letMeSetSpeed(1)}
                src={IMAGES.speed_1x}
                alt="1x"
                className={speed === 1 ? "bg-gray-200" : ""}
              ></IconClick>
              <IconClick
                size="lg"
                onClick={letMeSetSpeed(1.2)}
                src={IMAGES.speed_1_2_x}
                alt="1.2x"
                className={speed === 1.2 ? "bg-gray-200" : ""}
              ></IconClick>
              <IconClick
                size="lg"
                onClick={letMeSetSpeed(1.5)}
                src={IMAGES.speed_1_5x}
                alt="1.5x"
                className={speed === 1.5 ? "bg-gray-200" : ""}
              ></IconClick>
            </div>
          )}
          {/* 播放/暂停按钮 */}
          <IconClick
            size="lg"
            onClick={speak}
            src={pause ? IMAGES.play_arrow : IMAGES.pause}
            alt="playorpause"
            className={`${processing ? "bg-gray-200" : ""}`}
          ></IconClick>
          {/* 自动暂停按钮 */}
          <IconClick
            size="lg"
            onClick={() => {
              setAutopause(!autopause);
              if (objurlRef.current) {
                stop();
              }
              setPause(true);
            }}
            src={autopause ? IMAGES.autoplay : IMAGES.autopause}
            alt="autoplayorpause"
          ></IconClick>
          {/* 速度调节按钮 */}
          <IconClick
            size="lg"
            onClick={() => setShowSpeedAdjust(!showSpeedAdjust)}
            src={IMAGES.speed}
            alt="speed"
            className={`${showSpeedAdjust ? "bg-gray-200" : ""}`}
          ></IconClick>
          {/* 保存按钮 */}
          <IconClick
            size="lg"
            onClick={save}
            src={IMAGES.save}
            alt="save"
            className={`${saving ? "bg-gray-200" : ""}`}
          ></IconClick>
          {/* 语言选择器 */}
          <div className="w-full flex flex-row flex-wrap gap-2 justify-center items-center">
            <span className="text-sm text-gray-600">{t("language")}</span>
            {TTS_LANGUAGES.slice(0, 6).map((lang) => (
              <Button
                variant="secondary"
                key={lang.value}
                selected={!customLanguage && selectedLanguage === lang.value}
                onClick={() => {
                  setSelectedLanguage(lang.value);
                  setCustomLanguage("");
                  if (objurlRef.current) URL.revokeObjectURL(objurlRef.current);
                  objurlRef.current = null;
                  setPause(true);
                }}
                size="sm"
              >
                {getLanguageLabel(t, lang.label)}
              </Button>
            ))}
            <Input
              variant="bordered"
              size="sm"
              value={customLanguage}
              onChange={(e) => {
                setCustomLanguage(e.target.value);
                setSelectedLanguage("Auto");
                if (objurlRef.current) URL.revokeObjectURL(objurlRef.current);
                objurlRef.current = null;
                setPause(true);
              }}
              placeholder={t("customLanguage")}
              className="w-auto min-w-[120px]"
            />
          </div>
          {/* 功能开关按钮 */}
          <div className="w-full flex flex-row flex-wrap gap-2 justify-center items-center">
            <Button
              variant="secondary"
              selected={ipaEnabled}
              onClick={() => setIPAEnabled(!ipaEnabled)}
            >
              {t("generateIPA")}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setShowSaveList(!showSaveList);
              }}
              selected={showSaveList}
            >
              {t("viewSavedItems")}
            </Button>
          </div>
        </div>
      </div>
      {/* 保存列表 */}
      {showSaveList && (
        <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
          <SaveList show={showSaveList} handleUse={handleUseItem}></SaveList>
        </div>
      )}
    </PageLayout>
  );
}
