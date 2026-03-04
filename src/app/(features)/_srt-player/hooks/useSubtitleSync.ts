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
  const hasAutoPausedRef = useRef<{ [key: number]: boolean }>({}); // 追踪每个字幕是否已触发自动暂停
  const rafIdRef = useRef<number>(0);

  // 从 store 获取状态
  const subtitleData = useSrtPlayerStore((state) => state.subtitle.data);
  const isPlaying = useSrtPlayerStore((state) => state.video.isPlaying);
  const autoPause = useSrtPlayerStore((state) => state.controls.autoPause);

  // Store actions
  const setCurrentSubtitle = useSrtPlayerStore((state) => state.setCurrentSubtitle);
  const seek = useSrtPlayerStore((state) => state.seek);
  const pause = useSrtPlayerStore((state) => state.pause);

  // 同步循环
  useEffect(() => {
    const syncSubtitles = () => {
      // 从 store 获取最新的 currentTime
      const currentTime = useSrtPlayerStore.getState().video.currentTime;

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

      // 检查是否需要自动暂停（每个字幕只触发一次）
      if (autoPause && currentIndex !== null) {
        const currentSubtitle = subtitleData[currentIndex];
        const timeUntilEnd = currentSubtitle.end - currentTime;

        // 在字幕结束前 0.2 秒触发自动暂停
        if (timeUntilEnd <= 0.2 && timeUntilEnd > 0 && !hasAutoPausedRef.current[currentIndex]) {
          hasAutoPausedRef.current[currentIndex] = true;
          seek(currentSubtitle.start);
          // 使用 setTimeout 确保在 seek 之后暂停
          setTimeout(() => {
            pause();
          }, 0);
        }
      }

      // 如果视频正在播放，继续循环
      if (useSrtPlayerStore.getState().video.isPlaying) {
        rafIdRef.current = requestAnimationFrame(syncSubtitles);
      }
    };

    if (subtitleData.length > 0 && isPlaying) {
      rafIdRef.current = requestAnimationFrame(syncSubtitles);
    }

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [subtitleData, isPlaying, autoPause, setCurrentSubtitle, seek, pause]);

  // 重置最后字幕引用
  useEffect(() => {
    lastSubtitleRef.current = null;
    hasAutoPausedRef.current = {};
  }, [subtitleData]);
}
