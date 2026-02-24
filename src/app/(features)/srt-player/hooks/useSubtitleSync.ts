"use client";

import { useEffect, useRef } from "react";
import { useSrtPlayerStore } from "../store";

/**
 * useSubtitleSync - 字幕同步 Hook
 *
 * 自动同步视频播放时间与字幕显示，支持自动暂停功能。
 * 使用 Zustand store 获取状态，无需传入参数。
 */
export function useSubtitleSync() {
  const lastSubtitleRef = useRef<number | null>(null);
  const rafIdRef = useRef<number>(0);

  // 从 store 获取状态
  const subtitleData = useSrtPlayerStore((state) => state.subtitle.data);
  const currentTime = useSrtPlayerStore((state) => state.video.currentTime);
  const isPlaying = useSrtPlayerStore((state) => state.video.isPlaying);
  const autoPause = useSrtPlayerStore((state) => state.controls.autoPause);

  // Store actions
  const setCurrentSubtitle = useSrtPlayerStore((state) => state.setCurrentSubtitle);
  const seek = useSrtPlayerStore((state) => state.seek);
  const pause = useSrtPlayerStore((state) => state.pause);

  // 获取当前时间对应的字幕索引
  const getCurrentSubtitleIndex = (time: number): number | null => {
    for (let i = 0; i < subtitleData.length; i++) {
      const subtitle = subtitleData[i];
      if (time >= subtitle.start && time <= subtitle.end) {
        return i;
      }
    }
    return null;
  };

  // 检查是否需要自动暂停
  const shouldAutoPause = (subtitle: { start: number; end: number }, time: number): boolean => {
    return autoPause && time >= subtitle.end - 0.2 && time < subtitle.end;
  };

  // 同步循环
  useEffect(() => {
    const syncSubtitles = () => {
      const currentIndex = getCurrentSubtitleIndex(currentTime);

      // 检查字幕是否发生变化
      if (currentIndex !== lastSubtitleRef.current) {
        lastSubtitleRef.current = currentIndex;

        if (currentIndex !== null) {
          const subtitle = subtitleData[currentIndex];
          setCurrentSubtitle(subtitle.text, currentIndex);
        } else {
          setCurrentSubtitle('', null);
        }
      }

      // 检查是否需要自动暂停
      const currentSubtitle = currentIndex !== null ? subtitleData[currentIndex] : null;
      if (currentSubtitle && shouldAutoPause(currentSubtitle, currentTime)) {
        seek(currentSubtitle.start);
        pause();
      }

      rafIdRef.current = requestAnimationFrame(syncSubtitles);
    };

    if (subtitleData.length > 0 && isPlaying) {
      rafIdRef.current = requestAnimationFrame(syncSubtitles);
    }

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [subtitleData, currentTime, isPlaying, autoPause, setCurrentSubtitle, seek, pause]);

  // 重置最后字幕引用
  useEffect(() => {
    lastSubtitleRef.current = null;
  }, [subtitleData]);
}
