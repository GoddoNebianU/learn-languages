"use client";

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { toast } from 'sonner';
import type {
  SrtPlayerStore,
  VideoState,
  SubtitleState,
  ControlState,
  SubtitleSettings,
  SubtitleEntry,
} from './types';
import type { RefObject } from 'react';

let videoRef: RefObject<HTMLVideoElement | null> | null;

export function setVideoRef(ref: RefObject<HTMLVideoElement | null> | null) {
  videoRef = ref;
}

// 初始状态
const initialVideoState: VideoState = {
  url: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  playbackRate: 1.0,
  volume: 1.0,
};

const initialSubtitleSettings: SubtitleSettings = {
  fontSize: 24,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  textColor: '#ffffff',
  position: 'bottom',
  fontFamily: 'sans-serif',
  opacity: 1,
};

const initialSubtitleState: SubtitleState = {
  url: null,
  data: [],
  currentText: '',
  currentIndex: null,
  settings: initialSubtitleSettings,
};

const initialControlState: ControlState = {
  autoPause: true,
  showShortcuts: false,
  showSettings: false,
};

export const useSrtPlayerStore = create<SrtPlayerStore>()(
  devtools(
    (set, get) => ({
      // ==================== Initial State ====================
      video: initialVideoState,
      subtitle: initialSubtitleState,
      controls: initialControlState,

      // ==================== Video Actions ====================
      setVideoUrl: (url) =>
        set((state) => {
          if (videoRef?.current) {
            videoRef.current.src = url || '';
            videoRef.current.load();
          }
          return { video: { ...state.video, url } };
        }),

      setPlaying: (playing) =>
        set((state) => ({ video: { ...state.video, isPlaying: playing } })),

      setCurrentTime: (time) =>
        set((state) => ({ video: { ...state.video, currentTime: time } })),

      setDuration: (duration) =>
        set((state) => ({ video: { ...state.video, duration } })),

      setPlaybackRate: (rate) =>
        set((state) => {
          if (videoRef?.current) {
            videoRef.current.playbackRate = rate;
          }
          return { video: { ...state.video, playbackRate: rate } };
        }),

      setVolume: (volume) =>
        set((state) => {
          if (videoRef?.current) {
            videoRef.current.volume = volume;
          }
          return { video: { ...state.video, volume } };
        }),

      play: () => {
        const state = get();
        if (!state.video.url || !state.subtitle.url || state.subtitle.data.length === 0) {
          toast.error('请先上传视频和字幕文件');
          return;
        }
        if (videoRef?.current) {
          videoRef.current.play().catch((error) => {
            toast.error('视频播放失败: ' + error.message);
          });
          set({ video: { ...state.video, isPlaying: true } });
        }
      },

      pause: () => {
        if (videoRef?.current) {
          // 只有在视频正在播放时才暂停，避免重复调用
          if (!videoRef.current.paused) {
            videoRef.current.pause();
          }
          set((state) => ({ video: { ...state.video, isPlaying: false } }));
        }
      },

      togglePlayPause: () => {
        const state = get();
        if (state.video.isPlaying) {
          get().pause();
        } else {
          get().play();
        }
      },

      seek: (time) => {
        if (videoRef?.current) {
          videoRef.current.currentTime = time;
          set((state) => ({ video: { ...state.video, currentTime: time } }));
        }
      },

      restart: () => {
        const state = get();
        if (state.subtitle.currentIndex !== null) {
          const currentSubtitle = state.subtitle.data[state.subtitle.currentIndex];
          if (currentSubtitle) {
            get().seek(currentSubtitle.start);
            get().play();
          }
        }
      },

      // ==================== Subtitle Actions ====================
      setSubtitleUrl: (url) =>
        set((state) => ({ subtitle: { ...state.subtitle, url } })),

      setSubtitleData: (data) =>
        set((state) => ({ subtitle: { ...state.subtitle, data } })),

      setCurrentSubtitle: (text, index) =>
        set((state) => ({
          subtitle: {
            ...state.subtitle,
            currentText: text,
            currentIndex: index,
          },
        })),

      updateSettings: (settings) =>
        set((state) => ({
          subtitle: {
            ...state.subtitle,
            settings: { ...state.subtitle.settings, ...settings },
          },
        })),

      nextSubtitle: () => {
        const state = get();
        if (
          state.subtitle.currentIndex !== null &&
          state.subtitle.currentIndex + 1 < state.subtitle.data.length
        ) {
          const nextIndex = state.subtitle.currentIndex + 1;
          const nextSubtitle = state.subtitle.data[nextIndex];
          get().seek(nextSubtitle.start);
          get().play();
        }
      },

      previousSubtitle: () => {
        const state = get();
        if (state.subtitle.currentIndex !== null && state.subtitle.currentIndex > 0) {
          const prevIndex = state.subtitle.currentIndex - 1;
          const prevSubtitle = state.subtitle.data[prevIndex];
          get().seek(prevSubtitle.start);
          get().play();
        }
      },

      restartSubtitle: () => {
        const state = get();
        if (state.subtitle.currentIndex !== null) {
          const currentSubtitle = state.subtitle.data[state.subtitle.currentIndex];
          get().seek(currentSubtitle.start);
          get().play();
        }
      },

      // ==================== Controls Actions ====================
      toggleAutoPause: () =>
        set((state) => ({
          controls: { ...state.controls, autoPause: !state.controls.autoPause },
        })),

      toggleShortcuts: () =>
        set((state) => ({
          controls: { ...state.controls, showShortcuts: !state.controls.showShortcuts },
        })),

      toggleSettings: () =>
        set((state) => ({
          controls: { ...state.controls, showSettings: !state.controls.showSettings },
        })),
    }),
    { name: 'srt-player-store' }
  )
);
