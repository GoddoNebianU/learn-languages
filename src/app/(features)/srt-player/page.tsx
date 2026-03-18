"use client";

import { useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { PageLayout } from "@/components/ui/PageLayout";
import { LightButton } from "@/design-system/base/button";
import { HStack } from "@/design-system/layout/stack";
import { Video, FileText, ChevronLeft, ChevronRight, RotateCcw, Pause, Play } from "lucide-react";
import { useVideoSync } from "./hooks/useVideoSync";
import { useSubtitleSync } from "./hooks/useSubtitleSync";
import { useSrtPlayerShortcuts } from "./hooks/useKeyboardShortcuts";
import { loadSubtitle } from "./utils/subtitleParser";
import { useSrtPlayerStore } from "./stores/srtPlayerStore";
import { useFileUpload } from "./hooks/useFileUpload";
import { setVideoRef } from "./stores/srtPlayerStore";
import Link from "next/link";

export default function SrtPlayerPage() {
  const t = useTranslations("home");
  const srtT = useTranslations("srt_player");

  const videoRef = useRef<HTMLVideoElement>(null);
  const { uploadVideo, uploadSubtitle } = useFileUpload();

  const subtitleUrl = useSrtPlayerStore((state) => state.subtitle.url);
  const setSubtitleData = useSrtPlayerStore((state) => state.setSubtitleData);
  const setSubtitleUrl = useSrtPlayerStore((state) => state.setSubtitleUrl);
  const setVideoUrl = useSrtPlayerStore((state) => state.setVideoUrl);

  const videoUrl = useSrtPlayerStore((state) => state.video.url);
  const subtitleData = useSrtPlayerStore((state) => state.subtitle.data);
  const currentIndex = useSrtPlayerStore((state) => state.subtitle.currentIndex);
  const isPlaying = useSrtPlayerStore((state) => state.video.isPlaying);
  const playbackRate = useSrtPlayerStore((state) => state.video.playbackRate);
  const autoPause = useSrtPlayerStore((state) => state.controls.autoPause);

  const togglePlayPause = useSrtPlayerStore((state) => state.togglePlayPause);
  const nextSubtitle = useSrtPlayerStore((state) => state.nextSubtitle);
  const previousSubtitle = useSrtPlayerStore((state) => state.previousSubtitle);
  const restartSubtitle = useSrtPlayerStore((state) => state.restartSubtitle);
  const setPlaybackRate = useSrtPlayerStore((state) => state.setPlaybackRate);
  const toggleAutoPause = useSrtPlayerStore((state) => state.toggleAutoPause);
  const seek = useSrtPlayerStore((state) => state.seek);

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
        .then((subtitleData) => {
          setSubtitleData(subtitleData);
          toast.success(srtT("subtitleLoadSuccess"));
        })
        .catch((error) => {
          toast.error(srtT("subtitleLoadFailed") + ": " + error.message);
        });
    }
  }, [srtT, subtitleUrl, setSubtitleData]);

  const handleVideoUpload = () => {
    uploadVideo((url) => {
      setVideoUrl(url);
    }, (error) => {
      toast.error(srtT('videoUploadFailed') + ': ' + error.message);
    });
  };

  const handleSubtitleUpload = () => {
    uploadSubtitle((url) => {
      setSubtitleUrl(url);
    }, (error) => {
      toast.error(srtT('subtitleUploadFailed') + ': ' + error.message);
    });
  };

  const handlePlaybackRateChange = () => {
    const rates = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
    const currentIndexRate = rates.indexOf(playbackRate);
    const nextIndexRate = (currentIndexRate + 1) % rates.length;
    setPlaybackRate(rates[nextIndexRate]);
  };

  const currentSubtitle = currentIndex !== null ? subtitleData[currentIndex] : null;

  return (
    <PageLayout>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          {t("srtPlayer.name")}
        </h1>
        <p className="text-lg text-gray-600">
          {t("srtPlayer.description")}
        </p>
      </div>

      <video 
        ref={videoRef} 
        width="85%" 
        className="mx-auto"
        playsInline
      />

      <div className="shadow rounded h-20 w-[85%] mx-auto flex-wrap flex items-begin justify-center">
        {currentSubtitle && currentSubtitle.text.split(" ").map((s, i) => (
          <Link
            key={i}
            href={`/dictionary?q=${s}`}
            className="px-1 h-fit hover:bg-gray-200 hover:cursor-pointer"
            target="_blank"
            rel="noopener noreferrer"
          >
            {s}
          </Link>
        ))}
      </div>

      <div className="mx-auto mt-4 flex items-center justify-center flex-wrap gap-2 w-[85%]">
        <div className="border-gray-200 border-2 flex items p-2 justify-between items-center rounded gap-8">
          <div className="flex items-center flex-col">
            <Video size={16} />
            <span className="text-sm">{srtT("videoFile")}</span>
          </div>
          <LightButton onClick={handleVideoUpload} disabled={!!videoUrl}>
            {videoUrl ? srtT("uploaded") : srtT("uploadVideoButton")}
          </LightButton>
        </div>
        <div className="border-gray-200 border-2 flex items p-2 justify-between items-center rounded gap-8">
          <div className="flex items-center flex-col">
            <FileText size={16} />
            <span className="text-sm">
              {subtitleData.length > 0 ? srtT("subtitleUploaded", { count: subtitleData.length }) : srtT("subtitleNotUploaded")}
            </span>
          </div>
          <LightButton onClick={handleSubtitleUpload} disabled={!!subtitleUrl}>
            {subtitleUrl ? srtT("uploaded") : srtT("uploadSubtitleButton")}
          </LightButton>
        </div>
      </div>

      {canPlay && (
        <HStack gap={2} className="mx-auto mt-4 w-[85%]" justify={"center"} wrap>
          {isPlaying ? (
            <LightButton onClick={togglePlayPause} leftIcon={<Pause className="w-4 h-4" />}>
              {srtT('pause')}
            </LightButton>
          ) : (
            <LightButton onClick={togglePlayPause} leftIcon={<Play className="w-4 h-4" />}>
              {srtT('play')}
            </LightButton>
          )}
          <LightButton onClick={previousSubtitle} leftIcon={<ChevronLeft className="w-4 h-4" />}>
            {srtT('previous')}
          </LightButton>
          <LightButton onClick={nextSubtitle} rightIcon={<ChevronRight className="w-4 h-4" />}>
            {srtT('next')}
          </LightButton>
          <LightButton onClick={restartSubtitle} leftIcon={<RotateCcw className="w-4 h-4" />}>
            {srtT('restart')}
          </LightButton>
          <LightButton onClick={handlePlaybackRateChange}>
            {playbackRate}x
          </LightButton>
          <LightButton onClick={toggleAutoPause}>
            {srtT('autoPause', { enabled: autoPause ? srtT('on') : srtT('off') })}
          </LightButton>
        </HStack>
      )}
    </PageLayout>
  );
}
