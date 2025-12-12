"use client";

import { useCallback, useEffect } from "react";
import { KeyboardShortcut } from "../types/controls";

export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  enabled: boolean = true
) {
  const handleKeyDown = useCallback((event: globalThis.KeyboardEvent) => {
    if (!enabled) return;
    
    // 防止在输入框中触发快捷键
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return;
    }
    
    const shortcut = shortcuts.find(s => s.key === event.key);
    if (shortcut) {
      event.preventDefault();
      shortcut.action();
    }
  }, [shortcuts, enabled]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}

export function createSrtPlayerShortcuts(
  playPause: () => void,
  next: () => void,
  previous: () => void,
  restart: () => void,
  toggleAutoPause: () => void
): KeyboardShortcut[] {
  return [
    {
      key: ' ',
      description: '播放/暂停',
      action: playPause,
    },
    {
      key: 'n',
      description: '下一句',
      action: next,
    },
    {
      key: 'p',
      description: '上一句',
      action: previous,
    },
    {
      key: 'r',
      description: '句首',
      action: restart,
    },
    {
      key: 'a',
      description: '切换自动暂停',
      action: toggleAutoPause,
    },
  ];
}