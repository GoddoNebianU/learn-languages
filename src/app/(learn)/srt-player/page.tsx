"use client";

import { useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { PageLayout } from "@/components/ui/PageLayout";
import { Button } from "@/design-system/button";
import { HStack } from "@/design-system/stack";
import { Video, FileText, ChevronLeft, ChevronRight, RotateCcw, Pause, Play } from "lucide-react";
import { useVideoSync } from "./hooks/useVideoSync";
import { useSubtitleSync } from "./hooks/useSubtitleSync";
import { useSrtPlayerShortcuts } from "./hooks/useKeyboardShortcuts";
import { loadSubtitle } from "./utils/subtitleParser";
import { useSrtPlayerStore, setVideoRef } from "./stores/srtPlayerStore";
import { useFileUpload } from "./hooks/useFileUpload";
import { SubtitleProgressBar } from "./components/SubtitleProgressBar";
import Link from "next/link";

export default function SrtPlayerPage() {
  const t = useTranslations("home");
  const srtT = useTranslations("srt_player");

  const videoRef = useRef<HTMLVideoElement>(null);
  const { uploadVideo, uploadSubtitle } = useFileUpload();

  const videoUrl = useSrtPlayerStore((state) => state.video.url);
  const subtitleUrl = useSrtPlayerStore((state) => state.subtitle.url);
  const subtitleData = useSrtPlayerStore((state) => state.subtitle.data);
  const currentIndex = useSrtPlayerStore((state) => state.subtitle.currentIndex);
  const isPlaying = useSrtPlayerStore((state) => state.video.isPlaying);
  const playbackRate = useSrtPlayerStore((state) => state.video.playbackRate);
  const autoPause = useSrtPlayerStore((state) => state.controls.autoPause);

  const setVideoUrl = useSrtPlayerStore((state) => state.setVideoUrl);
  const setSubtitleUrl = useSrtPlayerStore((state) => state.setSubtitleUrl);
  const setSubtitleData = useSrtPlayerStore((state) => state.setSubtitleData);
  const togglePlayPause = useSrtPlayerStore((state) => state.togglePlayPause);
  const nextSubtitle = useSrtPlayerStore((state) => state.nextSubtitle);
  const previousSubtitle = useSrtPlayerStore((state) => state.previousSubtitle);
  const restartSubtitle = useSrtPlayerStore((state) => state.restartSubtitle);
  const setPlaybackRate = useSrtPlayerStore((state) => state.setPlaybackRate);
  const toggleAutoPause = useSrtPlayerStore((state) => state.toggleAutoPause);

  useVideoSync(videoRef);
  useSubtitleSync();
  useSrtPlayerShortcuts();

  useEffect(() => {
    setVideoRef(videoRef);
  }, [videoRef]);

  const canPlay = !!videoUrl && !!subtitleUrl && subtitleData.length > 0;

  useEffect(() => {
    if (subtitleUrl) {
      loadSubtitle(subtitleUrl)
        .then((data) => {
          setSubtitleData(data);
          toast.success(srtT("subtitleLoadSuccess"));
        })
        .catch((error) => {
          toast.error(srtT("subtitleLoadFailed") + ": " + error.message);
        });
    }
  }, [srtT, subtitleUrl, setSubtitleData]);

  const handleVideoUpload = () => {
    uploadVideo(
      (url) => {
        setVideoUrl(url);
      },
      (error) => {
        toast.error(srtT("videoUploadFailed") + ": " + error.message);
      }
    );
  };

  const handleSubtitleUpload = () => {
    uploadSubtitle(
      (url) => {
        setSubtitleUrl(url);
      },
      (error) => {
        toast.error(srtT("subtitleUploadFailed") + ": " + error.message);
      }
    );
  };

  const handlePlaybackRateChange = () => {
    const rates = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
    const currentRateIndex = rates.indexOf(playbackRate);
    const nextRateIndex = (currentRateIndex + 1) % rates.length;
    setPlaybackRate(rates[nextRateIndex]);
  };

  const currentSubtitle = currentIndex !== null ? subtitleData[currentIndex] : null;

  return (
    <PageLayout>
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-4xl font-bold text-gray-800">{t("srtPlayer.name")}</h1>
        <p className="text-lg text-gray-600">{t("srtPlayer.description")}</p>
      </div>

      <video ref={videoRef} width="85%" className="mx-auto" playsInline />

      {canPlay && <SubtitleProgressBar className="mx-auto mt-2 w-[85%]" />}

      <div className="items-begin mx-auto flex h-20 w-[85%] flex-wrap justify-center overflow-y-auto rounded shadow">
        {currentSubtitle &&
          currentSubtitle.text.split(" ").map((word, i) => (
            <Link
              key={i}
              href={`/dictionary?q=${word}`}
              className="h-fit px-1 hover:cursor-pointer hover:bg-gray-200"
              target="_blank"
              rel="noopener noreferrer"
            >
              {word}
            </Link>
          ))}
      </div>

      <div className="mx-auto mt-4 flex w-[85%] items-center justify-center gap-4">
        <div className="flex items-center gap-3 rounded border-2 border-gray-200 px-3 py-2">
          <Video size={16} />
          <span className="text-sm">{srtT("videoFile")}</span>
          <Button variant="light" size="sm" onClick={handleVideoUpload}>
            {srtT("upload")}
          </Button>
        </div>
        <div className="flex items-center gap-3 rounded border-2 border-gray-200 px-3 py-2">
          <FileText size={16} />
          <span className="text-sm">{srtT("subtitleFile")}</span>
          <Button variant="light" size="sm" onClick={handleSubtitleUpload}>
            {srtT("upload")}
          </Button>
        </div>
      </div>

      {canPlay && (
        <HStack justify="center" gap={2} className="mt-4">
          <Button variant="light" size="sm" onClick={togglePlayPause}>
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            {isPlaying ? srtT("pause") : srtT("play")}
          </Button>
          <Button variant="light" size="sm" onClick={previousSubtitle}>
            <ChevronLeft size={16} />
            {srtT("previous")}
          </Button>
          <Button variant="light" size="sm" onClick={nextSubtitle}>
            {srtT("next")}
            <ChevronRight size={16} />
          </Button>
          <Button variant="light" size="sm" onClick={restartSubtitle}>
            <RotateCcw size={16} />
            {srtT("restart")}
          </Button>
          <Button variant="light" size="sm" onClick={handlePlaybackRateChange}>
            {playbackRate}x
          </Button>
          <Button
            variant={autoPause ? "primary" : "light"}
            size="sm"
            onClick={toggleAutoPause}
          >
            {srtT("autoPause", { enabled: autoPause ? srtT("on") : srtT("off") })}
          </Button>
        </HStack>
      )}
    </PageLayout>
  );
}
