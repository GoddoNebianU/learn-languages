import { useRef, useEffect, useState, useCallback } from "react";
import { synthesizeTts } from "@/lib/providers/tts";

/**
 * 可复用的音频播放 hook。
 *
 * TTS 通过 server action (synthesizeTts) 合成, 返回 base64 音频,
 * 解码为 blob 后播放。不暴露 HTTP 接口。
 *
 * - speak(text)     — TTS 全流程: synthesizeTts → base64 → blob → play
 * - playUrl(url)    — 直接 URL: fetch → blob → play
 * - replay()        — 重播当前音频 (不重新请求)
 * - reset()         — 停止并清空音频 (文本/卡片切换时调用)
 * - setSpeed(rate)  — 设置播放速度 (立即应用到 playbackRate)
 */
export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);
  const speedRef = useRef(1);
  const lastSpokenTextRef = useRef<string | null>(null);

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

  const loadFromBlob = useCallback(async (blob: Blob): Promise<void> => {
    const audio = audioRef.current;
    if (!audio) return;

    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    const objectUrl = URL.createObjectURL(blob);
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

  const speak = useCallback(async (text: string): Promise<void> => {
    const audio = audioRef.current;
    if (!audio) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await synthesizeTts(text);
      if (!result) throw new Error("TTS unavailable");

      const blob = await (await fetch(`data:${result.contentType};base64,${result.audio}`)).blob();
      await loadFromBlob(blob);
      setHasAudio(true);
      lastSpokenTextRef.current = text;
      setIsLoading(false);
      await audio.play();
    } catch (err) {
      setIsLoading(false);
      if (err instanceof DOMException && err.name === "AbortError") return;
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      throw e;
    }
  }, [loadFromBlob]);

  const playUrl = useCallback(async (url: string): Promise<void> => {
    const audio = audioRef.current;
    if (!audio) return;

    setIsLoading(true);
    setError(null);

    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      await loadFromBlob(await resp.blob());
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
  }, [loadFromBlob]);

  const replay = useCallback(async (): Promise<void> => {
    const audio = audioRef.current;
    if (!audio || !blobUrlRef.current) return;
    audio.currentTime = 0;
    await audio.play().catch(() => {});
  }, []);

  const playOrReplay = useCallback(
    async (text: string): Promise<void> => {
      if (blobUrlRef.current && lastSpokenTextRef.current === text) {
        await replay();
      } else {
        await speak(text);
      }
    },
    [replay, speak]
  );

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
    playOrReplay,
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
