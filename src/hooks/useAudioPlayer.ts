import { useRef, useEffect, useState, useCallback } from "react";
import { getTTSUrl } from "@/lib/providers/tts";

/**
 * 可复用的音频播放 hook。
 *
 * 所有音频通过 fetch → blob → object URL 加载, 避免 <audio> 元素
 * 对慢响应 (如 inference.sh TTS 生成 ~5s) 的超时问题。
 *
 * - speak(text, lang?)  — TTS 全流程: getTTSUrl → fetch → blob → play
 * - playUrl(url)        — 直接 URL: fetch → blob → play
 * - replay()            — 重播当前音频 (不重新请求)
 * - reset()             — 停止并清空音频 (文本/卡片切换时调用)
 * - setSpeed(rate)      — 设置播放速度 (修复: 立即应用到 playbackRate)
 */
export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);
  const speedRef = useRef(1);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    audioRef.current = audio;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const onError = () => {
      if (audio.error?.code !== MediaError.MEDIA_ERR_ABORTED) {
        setError(new Error(audio.error?.message || "Audio playback error"));
      }
      setIsLoading(false);
      setIsPlaying(false);
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audio.pause();
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    };
  }, []);

  const loadBlob = useCallback(async (url: string): Promise<void> => {
    const audio = audioRef.current;
    if (!audio) return;

    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const blob = await resp.blob();
    const objectUrl = URL.createObjectURL(blob);

    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    blobUrlRef.current = objectUrl;

    audio.src = objectUrl;
    audio.playbackRate = speedRef.current;

    if (audio.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      await new Promise<void>((resolve, reject) => {
        const onReady = () => {
          cleanup();
          resolve();
        };
        const onErr = () => {
          cleanup();
          reject(new Error("Audio decode failed"));
        };
        const cleanup = () => {
          audio.removeEventListener("canplay", onReady);
          audio.removeEventListener("error", onErr);
        };
        audio.addEventListener("canplay", onReady, { once: true });
        audio.addEventListener("error", onErr, { once: true });
      });
    }
  }, []);

  const speak = useCallback(
    async (text: string, lang?: string, regenerate?: boolean): Promise<void> => {
      const audio = audioRef.current;
      if (!audio) return;

      setIsLoading(true);
      setError(null);

      try {
        const ttsUrl = await getTTSUrl(text, lang ?? "Auto", regenerate);
        if (!ttsUrl) throw new Error("TTS not configured");

        await loadBlob(ttsUrl);
        setHasAudio(true);
        setIsLoading(false);
        await audio.play();
      } catch (err) {
        setIsLoading(false);
        if (err instanceof DOMException && err.name === "AbortError") return;
        const e = err instanceof Error ? err : new Error(String(err));
        setError(e);
        throw e;
      }
    },
    [loadBlob]
  );

  const playUrl = useCallback(
    async (url: string): Promise<void> => {
      const audio = audioRef.current;
      if (!audio) return;

      setIsLoading(true);
      setError(null);

      try {
        await loadBlob(url);
        setHasAudio(true);
        setIsLoading(false);
        await audio.play();
      } catch (err) {
        setIsLoading(false);
        if (err instanceof DOMException && err.name === "AbortError") return;
        const e = err instanceof Error ? err : new Error(String(err));
        setError(e);
        throw e;
      }
    },
    [loadBlob]
  );

  const replay = useCallback(async (): Promise<void> => {
    const audio = audioRef.current;
    if (!audio || !blobUrlRef.current) return;
    audio.currentTime = 0;
    await audio.play().catch(() => {});
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setCurrentTime(0);
  }, []);

  const reset = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.src = "";
    }
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    setHasAudio(false);
    setIsPlaying(false);
    setIsLoading(false);
    setCurrentTime(0);
    setDuration(0);
    setError(null);
  }, []);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(audio.duration || 0, time));
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  }, []);

  const setSpeed = useCallback((speed: number) => {
    speedRef.current = speed;
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, []);

  return {
    isPlaying,
    isLoading,
    hasAudio,
    error,
    duration,
    currentTime,
    speak,
    playUrl,
    replay,
    pause,
    stop,
    reset,
    seek,
    setVolume,
    setSpeed,
    audioRef,
  };
}
