"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "sonner";
import type { SrtPlayerStore, SubtitleEntry } from "../types";
import type { RefObject } from "react";

let videoRef: RefObject<HTMLVideoElement | null> | null;
let autoPauseTimeoutId: ReturnType<typeof setTimeout> | null = null;

export function setVideoRef(ref: RefObject<HTMLVideoElement | null> | null) {
  videoRef = ref;
}

export function getAutoPauseTimeout() {
  return autoPauseTimeoutId;
}

export function setAutoPauseTimeout(id: ReturnType<typeof setTimeout> | null) {
  if (autoPauseTimeoutId) {
    clearTimeout(autoPauseTimeoutId);
  }
  autoPauseTimeoutId = id;
}

export function clearAutoPauseTimeout() {
  if (autoPauseTimeoutId) {
    clearTimeout(autoPauseTimeoutId);
    autoPauseTimeoutId = null;
  }
}

let wasAutoPaused = false;

export function markAutoPaused() {
  wasAutoPaused = true;
}

export const useSrtPlayerStore = create<SrtPlayerStore>()(
  devtools(
    (set, get) => ({
      video: {
        url: null,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        playbackRate: 1.0,
      },

      subtitle: {
        url: null,
        data: [] as SubtitleEntry[],
        currentText: "",
        currentIndex: null as number | null,
      },

      controls: {
        autoPause: true,
      },

      setVideoUrl: (url) =>
        set((state) => {
          if (videoRef?.current) {
            videoRef.current.src = url || "";
            videoRef.current.load();
          }
          return { video: { ...state.video, url } };
        }),

      setSubtitleUrl: (url) => set((state) => ({ subtitle: { ...state.subtitle, url } })),
      setSubtitleData: (data) => set((state) => ({ subtitle: { ...state.subtitle, data } })),
      setCurrentSubtitle: (text, index) =>
        set((state) => ({ subtitle: { ...state.subtitle, currentText: text, currentIndex: index } })),
      setCurrentTime: (time) => set((state) => ({ video: { ...state.video, currentTime: time } })),
      setDuration: (duration) => set((state) => ({ video: { ...state.video, duration } })),
      setPlaybackRate: (rate) =>
        set((state) => {
          if (videoRef?.current) videoRef.current.playbackRate = rate;
          return { video: { ...state.video, playbackRate: rate } };
        }),

      play: () => {
        const state = get();
        if (!state.video.url || !state.subtitle.url || state.subtitle.data.length === 0) {
          toast.error("请先上传视频和字幕文件");
          return;
        }
        if (videoRef?.current) {
          videoRef.current.play().catch((error) => {
            toast.error("视频播放失败: " + error.message);
          });
          set({ video: { ...state.video, isPlaying: true } });
        }
      },

      pause: () => {
        if (videoRef?.current) {
          if (!videoRef.current.paused) videoRef.current.pause();
          set((state) => ({ video: { ...state.video, isPlaying: false } }));
        }
      },

      togglePlayPause: () => {
        const state = get();
        if (state.video.isPlaying) {
          wasAutoPaused = false;
          get().pause();
        } else {
          if (wasAutoPaused && state.controls.autoPause && state.subtitle.currentIndex !== null) {
            const sub = state.subtitle.data[state.subtitle.currentIndex];
            if (sub) get().seek(sub.start);
          }
          wasAutoPaused = false;
          get().play();
        }
      },

      seek: (time) => {
        if (videoRef?.current) {
          videoRef.current.currentTime = time;
          set((state) => ({ video: { ...state.video, currentTime: time } }));
        }
      },

      nextSubtitle: () => {
        const state = get();
        if (
          state.subtitle.currentIndex !== null &&
          state.subtitle.currentIndex + 1 < state.subtitle.data.length
        ) {
          clearAutoPauseTimeout();
          wasAutoPaused = false;
          const nextIdx = state.subtitle.currentIndex + 1;
          const next = state.subtitle.data[nextIdx];
          get().seek(next.start);
          get().setCurrentSubtitle(next.text, nextIdx);
          get().play();
        }
      },

      previousSubtitle: () => {
        const state = get();
        if (state.subtitle.currentIndex !== null && state.subtitle.currentIndex > 0) {
          clearAutoPauseTimeout();
          wasAutoPaused = false;
          const prevIdx = state.subtitle.currentIndex - 1;
          const prev = state.subtitle.data[prevIdx];
          get().seek(prev.start);
          get().setCurrentSubtitle(prev.text, prevIdx);
          get().play();
        }
      },

      restartSubtitle: () => {
        const state = get();
        if (state.subtitle.currentIndex !== null) {
          clearAutoPauseTimeout();
          wasAutoPaused = false;
          const current = state.subtitle.data[state.subtitle.currentIndex];
          get().seek(current.start);
          get().setCurrentSubtitle(current.text, state.subtitle.currentIndex);
          get().play();
        }
      },

      toggleAutoPause: () =>
        set((state) => ({
          controls: { autoPause: !state.controls.autoPause },
        })),
    }),
    { name: "srt-player-store" }
  )
);
