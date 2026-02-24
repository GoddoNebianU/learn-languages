"use client";

import { useEffect, type RefObject } from 'react';
import { useSrtPlayerStore } from '../store';

export function useVideoSync(videoRef: RefObject<HTMLVideoElement | null>) {
  const setCurrentTime = useSrtPlayerStore((state) => state.setCurrentTime);
  const setDuration = useSrtPlayerStore((state) => state.setDuration);
  const play = useSrtPlayerStore((state) => state.play);
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

    const handlePlay = () => {
      play();
    };

    const handlePause = () => {
      pause();
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [videoRef, setCurrentTime, setDuration, play, pause]);
}
