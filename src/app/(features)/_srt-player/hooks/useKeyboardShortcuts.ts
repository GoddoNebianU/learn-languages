"use client";

import { useEffect } from "react";
import { useSrtPlayerStore } from "../store";

/**
 * useSrtPlayerShortcuts - SRT 播放器快捷键 Hook
 *
 * 自动为 SRT 播放器设置键盘快捷键，无需传入参数。
 * 直接使用 Zustand store 中的 actions。
 */
export function useSrtPlayerShortcuts(enabled: boolean = true) {
  const togglePlayPause = useSrtPlayerStore((state) => state.togglePlayPause);
  const nextSubtitle = useSrtPlayerStore((state) => state.nextSubtitle);
  const previousSubtitle = useSrtPlayerStore((state) => state.previousSubtitle);
  const restartSubtitle = useSrtPlayerStore((state) => state.restartSubtitle);
  const toggleAutoPause = useSrtPlayerStore((state) => state.toggleAutoPause);

  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (!enabled) return;

      // 防止在输入框中触发快捷键
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      switch (event.key) {
        case ' ':
          event.preventDefault();
          togglePlayPause();
          break;
        case 'n':
        case 'N':
          event.preventDefault();
          nextSubtitle();
          break;
        case 'p':
        case 'P':
          event.preventDefault();
          previousSubtitle();
          break;
        case 'r':
        case 'R':
          event.preventDefault();
          restartSubtitle();
          break;
        case 'a':
        case 'A':
          event.preventDefault();
          toggleAutoPause();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, togglePlayPause, nextSubtitle, previousSubtitle, restartSubtitle, toggleAutoPause]);
}

// 保留通用快捷键 Hook 用于其他场景
export function useKeyboardShortcuts(
  shortcuts: Array<{ key: string; action: () => void }>,
  isEnabled: boolean = true
) {
  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (!isEnabled) return;

      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      const shortcut = shortcuts.find(s => s.key === event.key);
      if (shortcut) {
        event.preventDefault();
        shortcut.action();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts, isEnabled]);
}
