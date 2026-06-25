"use client";

import { useTranslations } from "next-intl";
import { Volume2 } from "lucide-react";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";

interface SpeakButtonProps {
  text: string;
  queryLang: string;
  className?: string;
}

export function SpeakButton({ text, queryLang, className }: SpeakButtonProps) {
  const t = useTranslations("dictionary");
  const { speak, isLoading } = useAudioPlayer();

  const handlePlay = async () => {
    if (isLoading || !text) return;
    const lang = queryLang
      ? queryLang.charAt(0).toUpperCase() + queryLang.slice(1)
      : "Auto";
    try {
      await speak(text, lang);
    } catch (e) {
      console.error("TTS playback failed", e);
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
