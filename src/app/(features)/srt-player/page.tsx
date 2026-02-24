"use client";

import { useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { PageLayout } from "@/components/ui/PageLayout";
import { VideoPlayerPanel } from "./components/VideoPlayerPanel";
import { ControlPanel } from "./components/ControlPanel";
import { useVideoSync } from "./hooks/useVideoSync";
import { useSubtitleSync } from "./hooks/useSubtitleSync";
import { useSrtPlayerShortcuts } from "./hooks/useKeyboardShortcuts";
import { loadSubtitle } from "./utils/subtitleParser";
import { useSrtPlayerStore } from "./store";

export default function SrtPlayerPage() {
  const t = useTranslations("home");
  const srtT = useTranslations("srt_player");

  const videoRef = useRef<HTMLVideoElement>(null);

  // Store state
  const subtitleUrl = useSrtPlayerStore((state) => state.subtitle.url);
  const setSubtitleData = useSrtPlayerStore((state) => state.setSubtitleData);

  // Hooks
  useVideoSync(videoRef);
  useSubtitleSync();
  useSrtPlayerShortcuts();

  // Load subtitle when URL changes
  useEffect(() => {
    if (subtitleUrl) {
      loadSubtitle(subtitleUrl)
        .then((subtitleData) => {
          setSubtitleData(subtitleData);
          toast.success(srtT("subtitleLoadSuccess"));
        })
        .catch((error) => {
          toast.error(srtT("subtitleLoadFailed") + ": " + error.message);
        });
    }
  }, [srtT, subtitleUrl, setSubtitleData]);

  return (
    <PageLayout>
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          {t("srtPlayer.name")}
        </h1>
        <p className="text-lg text-gray-600">
          {t("srtPlayer.description")}
        </p>
      </div>

      {/* Video Player */}
      <VideoPlayerPanel ref={videoRef} />

      {/* Control Panel */}
      <ControlPanel />
    </PageLayout>
  );
}
