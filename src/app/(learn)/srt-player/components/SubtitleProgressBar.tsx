"use client";

import { useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/utils/cn";
import { useSrtPlayerStore } from "../stores/srtPlayerStore";

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

interface SubtitleProgressBarProps {
  className?: string;
}

export function SubtitleProgressBar({ className }: SubtitleProgressBarProps) {
  const t = useTranslations("srt_player");
  const barRef = useRef<HTMLDivElement>(null);

  const currentTime = useSrtPlayerStore((state) => state.video.currentTime);
  const duration = useSrtPlayerStore((state) => state.video.duration);
  const subtitleData = useSrtPlayerStore((state) => state.subtitle.data);
  const currentIndex = useSrtPlayerStore((state) => state.subtitle.currentIndex);
  const seek = useSrtPlayerStore((state) => state.seek);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleBarClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!barRef.current || duration <= 0) return;
      const rect = barRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const time = (clickX / rect.width) * duration;
      seek(time);
    },
    [duration, seek]
  );

  const totalSubtitles = subtitleData.length;
  const subtitleIndexDisplay =
    currentIndex !== null ? `${currentIndex + 1} / ${totalSubtitles}` : `0 / ${totalSubtitles}`;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="text-xs text-gray-500 whitespace-nowrap tabular-nums text-right w-12 shrink-0">
        {subtitleIndexDisplay}
      </span>

      <div
        ref={barRef}
        className="relative flex-1 h-3 bg-gray-200 rounded-full cursor-pointer overflow-hidden"
        onClick={handleBarClick}
        role="slider"
        aria-label={t("subtitleProgress")}
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={currentTime}
        tabIndex={0}
      >
        <div
          className="absolute inset-y-0 left-0 bg-primary-500 rounded"
          style={{ width: `${progressPercent}%` }}
        />

        {subtitleData.map((entry, idx) => {
          if (duration <= 0) return null;
          const leftPercent = (entry.start / duration) * 100;
          const isCurrent = idx === currentIndex;
          return (
            <div
              key={entry.index}
              className={cn(
                "absolute top-1/2 -translate-y-1/2 w-[1px]",
                isCurrent ? "h-2 bg-primary-700" : "h-1.5 bg-gray-500/50"
              )}
              style={{ left: `${leftPercent}%` }}
            />
          );
        })}

        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 bg-primary-700 rounded-full border border-white shadow"
          style={{ left: `${progressPercent}%` }}
        />
      </div>

      <span className="text-xs text-gray-500 whitespace-nowrap tabular-nums text-left w-24 shrink-0">
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>
    </div>
  );
}
