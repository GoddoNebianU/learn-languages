"use client";

import { useReducer, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";
import { VideoState, VideoControls } from "../types/player";
import { SubtitleState, SubtitleEntry } from "../types/subtitle";
import { ControlState, ControlActions } from "../types/controls";

export interface SrtPlayerState {
  video: VideoState;
  subtitle: SubtitleState;
  controls: ControlState;
}

export interface SrtPlayerActions extends VideoControls, ControlActions {
  setVideoUrl: (url: string | null) => void;
  setSubtitleUrl: (url: string | null) => void;
  nextSubtitle: () => void;
  previousSubtitle: () => void;
  restartSubtitle: () => void;
  setSubtitleSettings: (settings: Partial<SubtitleState['settings']>) => void;
}

const initialState: SrtPlayerState = {
  video: {
    url: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    playbackRate: 1.0,
    volume: 1.0,
  },
  subtitle: {
    url: null,
    data: [],
    currentText: "",
    currentIndex: null,
    settings: {
      fontSize: 24,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      textColor: "#ffffff",
      position: "bottom",
      fontFamily: "sans-serif",
      opacity: 1,
    },
  },
  controls: {
    autoPause: true,
    showShortcuts: false,
    showSettings: false,
  },
};

type SrtPlayerAction =
  | { type: "SET_VIDEO_URL"; payload: string | null }
  | { type: "SET_PLAYING"; payload: boolean }
  | { type: "SET_CURRENT_TIME"; payload: number }
  | { type: "SET_DURATION"; payload: number }
  | { type: "SET_PLAYBACK_RATE"; payload: number }
  | { type: "SET_VOLUME"; payload: number }
  | { type: "SET_SUBTITLE_URL"; payload: string | null }
  | { type: "SET_SUBTITLE_DATA"; payload: SubtitleEntry[] }
  | { type: "SET_CURRENT_SUBTITLE"; payload: { text: string; index: number | null } }
  | { type: "SET_SUBTITLE_SETTINGS"; payload: Partial<SubtitleState['settings']> }
  | { type: "TOGGLE_AUTO_PAUSE" }
  | { type: "TOGGLE_SHORTCUTS" }
  | { type: "TOGGLE_SETTINGS" };

function srtPlayerReducer(state: SrtPlayerState, action: SrtPlayerAction): SrtPlayerState {
  switch (action.type) {
    case "SET_VIDEO_URL":
      return { ...state, video: { ...state.video, url: action.payload } };
    case "SET_PLAYING":
      return { ...state, video: { ...state.video, isPlaying: action.payload } };
    case "SET_CURRENT_TIME":
      return { ...state, video: { ...state.video, currentTime: action.payload } };
    case "SET_DURATION":
      return { ...state, video: { ...state.video, duration: action.payload } };
    case "SET_PLAYBACK_RATE":
      return { ...state, video: { ...state.video, playbackRate: action.payload } };
    case "SET_VOLUME":
      return { ...state, video: { ...state.video, volume: action.payload } };
    case "SET_SUBTITLE_URL":
      return { ...state, subtitle: { ...state.subtitle, url: action.payload } };
    case "SET_SUBTITLE_DATA":
      return { ...state, subtitle: { ...state.subtitle, data: action.payload } };
    case "SET_CURRENT_SUBTITLE":
      return {
        ...state,
        subtitle: {
          ...state.subtitle,
          currentText: action.payload.text,
          currentIndex: action.payload.index,
        },
      };
    case "SET_SUBTITLE_SETTINGS":
      return {
        ...state,
        subtitle: {
          ...state.subtitle,
          settings: { ...state.subtitle.settings, ...action.payload },
        },
      };
    case "TOGGLE_AUTO_PAUSE":
      return { ...state, controls: { ...state.controls, autoPause: !state.controls.autoPause } };
    case "TOGGLE_SHORTCUTS":
      return { ...state, controls: { ...state.controls, showShortcuts: !state.controls.showShortcuts } };
    case "TOGGLE_SETTINGS":
      return { ...state, controls: { ...state.controls, showSettings: !state.controls.showSettings } };
    default:
      return state;
  }
}

export function useSrtPlayer() {
  const [state, dispatch] = useReducer(srtPlayerReducer, initialState);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Video controls
  const play = useCallback(() => {
    // 检查是否同时有视频和字幕
    if (!state.video.url || !state.subtitle.url || state.subtitle.data.length === 0) {
      toast.error("请先上传视频和字幕文件");
      return;
    }
    
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        toast.error("视频播放失败: " + error.message);
      });
      dispatch({ type: "SET_PLAYING", payload: true });
    }
  }, [state.video.url, state.subtitle.url, state.subtitle.data.length, dispatch]);

  const pause = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      dispatch({ type: "SET_PLAYING", payload: false });
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    if (state.video.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [state.video.isPlaying, play, pause]);

  const seek = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      dispatch({ type: "SET_CURRENT_TIME", payload: time });
    }
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      dispatch({ type: "SET_PLAYBACK_RATE", payload: rate });
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      dispatch({ type: "SET_VOLUME", payload: volume });
    }
  }, []);

  const restart = useCallback(() => {
    if (videoRef.current && state.subtitle.currentIndex !== null) {
      const currentSubtitle = state.subtitle.data[state.subtitle.currentIndex];
      if (currentSubtitle) {
        seek(currentSubtitle.start);
        play();
      }
    }
  }, [state.subtitle.currentIndex, state.subtitle.data, seek, play]);

  // URL setters
  const setVideoUrl = useCallback((url: string | null) => {
    dispatch({ type: "SET_VIDEO_URL", payload: url });
    if (url && videoRef.current) {
      videoRef.current.src = url;
      videoRef.current.load();
    }
  }, []);

  const setSubtitleUrl = useCallback((url: string | null) => {
    dispatch({ type: "SET_SUBTITLE_URL", payload: url });
  }, []);

  // Subtitle controls
  const nextSubtitle = useCallback(() => {
    if (state.subtitle.currentIndex !== null && 
        state.subtitle.currentIndex + 1 < state.subtitle.data.length) {
      const nextIndex = state.subtitle.currentIndex + 1;
      const nextSubtitle = state.subtitle.data[nextIndex];
      seek(nextSubtitle.start);
      play();
    }
  }, [state.subtitle.currentIndex, state.subtitle.data, seek, play]);

  const previousSubtitle = useCallback(() => {
    if (state.subtitle.currentIndex !== null && state.subtitle.currentIndex > 0) {
      const prevIndex = state.subtitle.currentIndex - 1;
      const prevSubtitle = state.subtitle.data[prevIndex];
      seek(prevSubtitle.start);
      play();
    }
  }, [state.subtitle.currentIndex, state.subtitle.data, seek, play]);

  const restartSubtitle = useCallback(() => {
    if (state.subtitle.currentIndex !== null) {
      const currentSubtitle = state.subtitle.data[state.subtitle.currentIndex];
      seek(currentSubtitle.start);
      play();
    }
  }, [state.subtitle.currentIndex, state.subtitle.data, seek, play]);

  const setSubtitleSettings = useCallback((settings: Partial<SubtitleState['settings']>) => {
    dispatch({ type: "SET_SUBTITLE_SETTINGS", payload: settings });
  }, []);

  // Control actions
  const toggleAutoPause = useCallback(() => {
    dispatch({ type: "TOGGLE_AUTO_PAUSE" });
  }, []);

  const toggleShortcuts = useCallback(() => {
    dispatch({ type: "TOGGLE_SHORTCUTS" });
  }, []);

  const toggleSettings = useCallback(() => {
    dispatch({ type: "TOGGLE_SETTINGS" });
  }, []);

  // Video event handlers
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      dispatch({ type: "SET_CURRENT_TIME", payload: videoRef.current.currentTime });
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      dispatch({ type: "SET_DURATION", payload: videoRef.current.duration });
    }
  }, []);

  const handlePlay = useCallback(() => {
    dispatch({ type: "SET_PLAYING", payload: true });
  }, []);

  const handlePause = useCallback(() => {
    dispatch({ type: "SET_PLAYING", payload: false });
  }, []);

  // Set subtitle data
  const setSubtitleData = useCallback((data: SubtitleEntry[]) => {
    dispatch({ type: "SET_SUBTITLE_DATA", payload: data });
  }, []);

  // Set current subtitle
  const setCurrentSubtitle = useCallback((text: string, index: number | null) => {
    dispatch({ type: "SET_CURRENT_SUBTITLE", payload: { text, index } });
  }, []);

  const actions: SrtPlayerActions = {
    play,
    pause,
    togglePlayPause,
    seek,
    setPlaybackRate,
    setVolume,
    restart,
    setVideoUrl,
    setSubtitleUrl,
    nextSubtitle,
    previousSubtitle,
    restartSubtitle,
    setSubtitleSettings,
    toggleAutoPause,
    toggleShortcuts,
    toggleSettings,
  };

  return {
    state,
    actions,
    videoRef,
    videoEventHandlers: {
      onTimeUpdate: handleTimeUpdate,
      onLoadedMetadata: handleLoadedMetadata,
      onPlay: handlePlay,
      onPause: handlePause,
    },
    subtitleActions: {
      setSubtitleData,
      setCurrentSubtitle,
    },
  };
}

export type UseSrtPlayerReturn = ReturnType<typeof useSrtPlayer>;