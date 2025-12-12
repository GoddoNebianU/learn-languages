"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, RotateCcw, Pause } from "lucide-react";
import DarkButton from "@/components/ui/buttons/DarkButton";
import { ControlBarProps } from "../../types/controls";
import PlayButton from "../atoms/PlayButton";
import SpeedControl from "../atoms/SpeedControl";

export default function ControlBar({
  isPlaying,
  onPlayPause,
  onPrevious,
  onNext,
  onRestart,
  playbackRate,
  onPlaybackRateChange,
  autoPause,
  onAutoPauseToggle,
  disabled,
  className
}: ControlBarProps) {
  const t = useTranslations("srt_player");
  
  return (
    <div className={`flex flex-wrap gap-2 justify-center ${className || ''}`}>
      <PlayButton
        isPlaying={isPlaying}
        onToggle={onPlayPause}
        disabled={disabled}
      />
      
      <DarkButton
        onClick={disabled ? undefined : onPrevious}
        disabled={disabled}
        className="flex items-center px-3 py-2"
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        {t("previous")}
      </DarkButton>
      
      <DarkButton
        onClick={disabled ? undefined : onNext}
        disabled={disabled}
        className="flex items-center px-3 py-2"
      >
        {t("next")}
        <ChevronRight className="w-4 h-4 ml-2" />
      </DarkButton>
      
      <DarkButton
        onClick={disabled ? undefined : onRestart}
        disabled={disabled}
        className="flex items-center px-3 py-2"
      >
        <RotateCcw className="w-4 h-4 mr-2" />
        {t("restart")}
      </DarkButton>
      
      <SpeedControl
        playbackRate={playbackRate}
        onPlaybackRateChange={onPlaybackRateChange}
        disabled={disabled}
      />
      
      <DarkButton
        onClick={disabled ? undefined : onAutoPauseToggle}
        disabled={disabled}
        className="flex items-center px-3 py-2"
      >
        <Pause className="w-4 h-4 mr-2" />
        {t("autoPause", { enabled: autoPause ? t("on") : t("off") })}
      </DarkButton>
    </div>
  );
}