"use client";

import { useEffect, type RefObject } from "react";
import { useSrtPlayerStore } from "../stores/srtPlayerStore";

export function useVideoSync(videoRef: RefObject<HTMLVideoElement | null>) {
  const setCurrentTime = useSrtPlayerStore((state) => state.setCurrentTime);
  const setDuration = useSrtPlayerStore((state) => state.setDuration);
  const pause = useSrtPlayerStore((state) => state.pause);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleEnded = () => {
      pause();
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("ended", handleEnded);
    };
  }, [videoRef, setCurrentTime, setDuration, pause]);
}
