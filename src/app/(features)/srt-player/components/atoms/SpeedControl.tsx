"use client";

import React from "react";
import LightButton from "@/components/ui/buttons/LightButton";
import { SpeedControlProps } from "../../types/player";
import { getPlaybackRateOptions, getPlaybackRateLabel } from "../../utils/timeUtils";

export default function SpeedControl({ playbackRate, onPlaybackRateChange, disabled, className }: SpeedControlProps) {
  const speedOptions = getPlaybackRateOptions();
  
  const handleSpeedChange = React.useCallback(() => {
    const currentIndex = speedOptions.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % speedOptions.length;
    onPlaybackRateChange(speedOptions[nextIndex]);
  }, [playbackRate, onPlaybackRateChange, speedOptions]);

  return (
    <LightButton
      onClick={disabled ? undefined : handleSpeedChange}
      className={`${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className || ''}`}
    >
      {getPlaybackRateLabel(playbackRate)}
    </LightButton>
  );
}