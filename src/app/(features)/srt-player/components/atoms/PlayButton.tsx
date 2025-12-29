"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { LightButton } from "@/components/ui/buttons";
import { PlayButtonProps } from "../../types/player";

export default function PlayButton({ isPlaying, onToggle, disabled, className }: PlayButtonProps) {
  const t = useTranslations("srt_player");
  
  return (
    <LightButton
      onClick={disabled ? undefined : onToggle}
      disabled={disabled}
      className={`px-4 py-2 ${className || ''}`}
    >
      {isPlaying ? t("pause") : t("play")}
    </LightButton>
  );
}