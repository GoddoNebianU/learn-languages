"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Volume2 } from "lucide-react";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { getTTSUrl } from "@/lib/providers/tts";
import type { TTS_SUPPORTED_LANGUAGES } from "@/lib/providers/tts-languages";

// Map dictionary query language codes to TTS-supported languages.
// Unmapped codes (e.g. uyghur) fall back to "Auto".
const QUERY_LANG_TO_TTS: Record<string, TTS_SUPPORTED_LANGUAGES> = {
  english: "English",
  chinese: "Chinese",
  japanese: "Japanese",
  korean: "Korean",
  italian: "Italian",
};

interface SpeakButtonProps {
  text: string;
  queryLang: string;
  className?: string;
}

export function SpeakButton({ text, queryLang, className }: SpeakButtonProps) {
  const t = useTranslations("dictionary");
  const { play, load } = useAudioPlayer();
  const [isLoading, setIsLoading] = useState(false);

  const handlePlay = async () => {
    if (isLoading || !text) return;
    setIsLoading(true);
    try {
      const lang: TTS_SUPPORTED_LANGUAGES = QUERY_LANG_TO_TTS[queryLang] ?? "Auto";
      const audioUrl = await getTTSUrl(text, lang);
      if (audioUrl) {
        await load(audioUrl);
        play();
      }
    } catch (e) {
      console.error("TTS playback failed", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handlePlay}
      disabled={isLoading || !text}
      aria-label={t("readAloud")}
      title={t("readAloud")}
      className={`inline-flex shrink-0 items-center justify-center rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#35786f] disabled:cursor-not-allowed disabled:opacity-40 ${className ?? ""}`}
    >
      <Volume2 className="h-5 w-5" />
    </button>
  );
}
