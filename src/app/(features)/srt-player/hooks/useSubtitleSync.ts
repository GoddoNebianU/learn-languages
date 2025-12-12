"use client";

import { useCallback, useEffect, useRef } from "react";
import { SubtitleEntry } from "../types/subtitle";

export function useSubtitleSync(
  subtitles: SubtitleEntry[],
  currentTime: number,
  isPlaying: boolean,
  autoPause: boolean,
  onSubtitleChange: (subtitle: SubtitleEntry | null) => void,
  onAutoPauseTrigger?: (subtitle: SubtitleEntry) => void
) {
  const lastSubtitleRef = useRef<SubtitleEntry | null>(null);
  const rafIdRef = useRef<number>(0);

  // 获取当前时间对应的字幕
  const getCurrentSubtitle = useCallback((time: number): SubtitleEntry | null => {
    return subtitles.find(subtitle => time >= subtitle.start && time <= subtitle.end) || null;
  }, [subtitles]);

  // 获取最近的字幕索引
  const getNearestIndex = useCallback((time: number): number | null => {
    if (subtitles.length === 0) return null;
    
    // 如果时间早于第一个字幕开始时间
    if (time < subtitles[0].start) return null;
    
    // 如果时间晚于最后一个字幕结束时间
    if (time > subtitles[subtitles.length - 1].end) return subtitles.length - 1;
    
    // 二分查找找到当前时间对应的字幕
    let left = 0;
    let right = subtitles.length - 1;
    
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const subtitle = subtitles[mid];
      
      if (time >= subtitle.start && time <= subtitle.end) {
        return mid;
      } else if (time < subtitle.start) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    }
    
    // 如果没有找到完全匹配的字幕，返回最近的字幕索引
    return right >= 0 ? right : null;
  }, [subtitles]);

  // 检查是否需要自动暂停
  const shouldAutoPause = useCallback((subtitle: SubtitleEntry, time: number): boolean => {
    return autoPause &&
           time >= subtitle.end - 0.2 && // 增加时间窗口，确保自动暂停更可靠
           time < subtitle.end;
  }, [autoPause]);

  // 启动/停止同步循环
  useEffect(() => {
    const syncSubtitles = () => {
      const currentSubtitle = getCurrentSubtitle(currentTime);
      
      // 检查字幕是否发生变化
      if (currentSubtitle !== lastSubtitleRef.current) {
        const previousSubtitle = lastSubtitleRef.current;
        lastSubtitleRef.current = currentSubtitle;
        
        // 只有当有当前字幕时才调用onSubtitleChange
        // 在字幕间隙时保持之前的字幕索引，避免进度条跳到0
        if (currentSubtitle) {
          onSubtitleChange(currentSubtitle);
        }
      }
      
      // 检查是否需要自动暂停
      // 每次都检查，不只在字幕变化时检查
      if (currentSubtitle && shouldAutoPause(currentSubtitle, currentTime)) {
        onAutoPauseTrigger?.(currentSubtitle);
      } else if (!currentSubtitle && lastSubtitleRef.current && shouldAutoPause(lastSubtitleRef.current, currentTime)) {
        // 在字幕结束时，如果前一个字幕需要自动暂停，也要触发
        onAutoPauseTrigger?.(lastSubtitleRef.current);
      }
      
      rafIdRef.current = requestAnimationFrame(syncSubtitles);
    };

    if (subtitles.length > 0) {
      rafIdRef.current = requestAnimationFrame(syncSubtitles);
    }
    
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [subtitles.length, currentTime, getCurrentSubtitle, onSubtitleChange, shouldAutoPause, onAutoPauseTrigger]);

  // 重置最后字幕引用
  useEffect(() => {
    lastSubtitleRef.current = null;
  }, [subtitles]);

  return {
    getCurrentSubtitle,
    getNearestIndex,
    shouldAutoPause,
  };
}