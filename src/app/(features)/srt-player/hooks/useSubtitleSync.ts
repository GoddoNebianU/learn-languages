"use client";

import { useEffect, useRef, useCallback } from "react";
import { useSrtPlayerStore } from "../stores/srtPlayerStore";

export function useSubtitleSync() {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastIndexRef = useRef<number | null>(null);

  const subtitleData = useSrtPlayerStore((state) => state.subtitle.data);
  const isPlaying = useSrtPlayerStore((state) => state.video.isPlaying);
  const autoPause = useSrtPlayerStore((state) => state.controls.autoPause);
  const playbackRate = useSrtPlayerStore((state) => state.video.playbackRate);
  const currentTime = useSrtPlayerStore((state) => state.video.currentTime);

  const setCurrentSubtitle = useSrtPlayerStore((state) => state.setCurrentSubtitle);
  const pause = useSrtPlayerStore((state) => state.pause);

  const scheduleAutoPause = useCallback(() => {
    if (!autoPause || !isPlaying) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    const currentTimeNow = useSrtPlayerStore.getState().video.currentTime;
    const currentIndexNow = useSrtPlayerStore.getState().subtitle.currentIndex;

    if (currentIndexNow === null || !subtitleData[currentIndexNow]) {
      return;
    }

    const subtitle = subtitleData[currentIndexNow];
    const timeUntilEnd = subtitle.end - currentTimeNow;

    if (timeUntilEnd <= 0) {
      return;
    }

    const advanceTime = 0.15;
    const realTimeUntilPause = (timeUntilEnd - advanceTime) / playbackRate;

    if (realTimeUntilPause > 0) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        pause();
      }, realTimeUntilPause * 1000);
    }
  }, [autoPause, isPlaying, subtitleData, playbackRate, pause]);

  useEffect(() => {
    if (!subtitleData || subtitleData.length === 0) {
      setCurrentSubtitle('', null);
      lastIndexRef.current = null;
      return;
    }

    let newIndex: number | null = null;

    for (let i = 0; i < subtitleData.length; i++) {
      const subtitle = subtitleData[i];
      if (currentTime >= subtitle.start && currentTime <= subtitle.end) {
        newIndex = i;
        break;
      }
    }

    if (newIndex !== lastIndexRef.current) {
      lastIndexRef.current = newIndex;
      if (newIndex !== null) {
        setCurrentSubtitle(subtitleData[newIndex].text, newIndex);
      } else {
        setCurrentSubtitle('', null);
      }
    }
  }, [subtitleData, currentTime, setCurrentSubtitle]);

  useEffect(() => {
    scheduleAutoPause();
  }, [isPlaying, autoPause]);

  useEffect(() => {
    if (isPlaying && autoPause) {
      scheduleAutoPause();
    }
  }, [playbackRate, currentTime]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);
}
