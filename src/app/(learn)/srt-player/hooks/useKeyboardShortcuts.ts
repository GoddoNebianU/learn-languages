"use client";

import { useEffect } from "react";
import { useSrtPlayerStore } from "../stores/srtPlayerStore";

export function useSrtPlayerShortcuts(enabled = true) {
  const togglePlayPause = useSrtPlayerStore((state) => state.togglePlayPause);
  const nextSubtitle = useSrtPlayerStore((state) => state.nextSubtitle);
  const previousSubtitle = useSrtPlayerStore((state) => state.previousSubtitle);
  const restartSubtitle = useSrtPlayerStore((state) => state.restartSubtitle);
  const toggleAutoPause = useSrtPlayerStore((state) => state.toggleAutoPause);

  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (!enabled) return;

      const target = event.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        return;
      }

      switch (event.key) {
        case " ":
          event.preventDefault();
          togglePlayPause();
          break;
        case "n":
        case "N":
          event.preventDefault();
          nextSubtitle();
          break;
        case "p":
        case "P":
          event.preventDefault();
          previousSubtitle();
          break;
        case "r":
        case "R":
          event.preventDefault();
          restartSubtitle();
          break;
        case "a":
        case "A":
          event.preventDefault();
          toggleAutoPause();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, togglePlayPause, nextSubtitle, previousSubtitle, restartSubtitle, toggleAutoPause]);
}
