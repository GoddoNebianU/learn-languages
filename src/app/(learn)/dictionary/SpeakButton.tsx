"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Volume2 } from "lucide-react";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { getTTSUrl } from "@/lib/providers/tts";

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
      const lang = queryLang
        ? queryLang.charAt(0).toUpperCase() + queryLang.slice(1)
        : "Auto";
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
