import { useRef, useEffect, useState, useCallback } from "react";

type AudioPlayerError = Error | null;

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [state, setState] = useState({
    isPlaying: false,
    isLoading: false,
    duration: 0,
    currentTime: 0,
    volume: 1,
  });
  const [error, setError] = useState<AudioPlayerError>(null);

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audioRef.current = audio;

    // Event listeners
    const handleLoadStart = () =>
      setState((prev) => ({ ...prev, isLoading: true }));
    const handleCanPlay = () =>
      setState((prev) => ({ ...prev, isLoading: false }));
    const handleLoadedMetadata = () =>
      setState((prev) => ({ ...prev, duration: audio.duration }));
    const handleTimeUpdate = () =>
      setState((prev) => ({ ...prev, currentTime: audio.currentTime }));
    const handleEnded = () =>
      setState((prev) => ({ ...prev, isPlaying: false, currentTime: 0 }));
    const handleError = (e: Event) => {
      const target = e.target as HTMLAudioElement;
      // 忽略中止错误，这些是预期的
      if (target.error?.code !== MediaError.MEDIA_ERR_ABORTED) {
        setError(new Error(target.error?.message || "Audio playback error"));
      }
      setState((prev) => ({ ...prev, isLoading: false, isPlaying: false }));
    };

    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      // 中止所有进行中的操作
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, []);

  const play = useCallback(async () => {
    if (!audioRef.current) return;

    try {
      setError(null);
      await audioRef.current.play();
      setState((prev) => ({ ...prev, isPlaying: true }));
    } catch (err) {
      // 忽略中止错误
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }
      const error =
        err instanceof Error ? err : new Error("Failed to play audio");
      setError(error);
      setState((prev) => ({ ...prev, isPlaying: false }));
      throw error;
    }
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setState((prev) => ({ ...prev, isPlaying: false }));
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setState((prev) => ({ ...prev, isPlaying: false, currentTime: 0 }));
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (audioRef.current) {
      const clampedVolume = Math.max(0, Math.min(1, volume));
      audioRef.current.volume = clampedVolume;
      setState((prev) => ({ ...prev, volume: clampedVolume }));
    }
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      const clampedTime = Math.max(
        0,
        Math.min(audioRef.current.duration || 0, time),
      );
      audioRef.current.currentTime = clampedTime;
      setState((prev) => ({ ...prev, currentTime: clampedTime }));
    }
  }, []);

  const load = useCallback(async (audioUrl: string) => {
    if (!audioRef.current) return;

    // 中止之前的加载操作
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      setError(null);
      setState((prev) => ({ ...prev, isLoading: true }));

      // 如果信号已经中止，直接返回
      if (abortController.signal.aborted) {
        return;
      }

      // 重置当前播放状态
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      // Only load if URL is different or we need to force reload
      if (audioRef.current.src !== audioUrl) {
        audioRef.current.src = audioUrl;
        
        await new Promise<void>((resolve, reject) => {
          if (!audioRef.current) {
            reject(new Error("Audio element not found"));
            return;
          }

          // 检查是否已经中止
          if (abortController.signal.aborted) {
            reject(new DOMException("Aborted", "AbortError"));
            return;
          }

          const handleCanPlay = () => {
            cleanup();
            resolve();
          };

          const handleError = (e: Event) => {
            cleanup();
            const target = e.target as HTMLAudioElement;
            // 如果是中止错误，不视为真正的错误
            if (target.error?.code === MediaError.MEDIA_ERR_ABORTED) {
              reject(new DOMException("Aborted", "AbortError"));
            } else {
              reject(new Error("Failed to load audio"));
            }
          };

          const handleAbort = () => {
            cleanup();
            reject(new DOMException("Aborted", "AbortError"));
          };

          const cleanup = () => {
            audioRef.current?.removeEventListener("canplay", handleCanPlay);
            audioRef.current?.removeEventListener("error", handleError);
            abortController.signal.removeEventListener("abort", handleAbort);
          };

          audioRef.current.addEventListener("canplay", handleCanPlay, { once: true });
          audioRef.current.addEventListener("error", handleError, { once: true });
          abortController.signal.addEventListener("abort", handleAbort, { once: true });

          // 如果音频已经可以播放，立即解析
          if (audioRef.current.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
            handleCanPlay();
          }
        });
      }

      if (!abortController.signal.aborted) {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    } catch (err) {
      // 忽略中止错误
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      const error =
        err instanceof Error ? err : new Error("Failed to load audio");
      setError(error);
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    } finally {
      // 清理中止控制器，如果仍然是当前的话
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
    }
  }, []);

  // 新增：同时加载和播放的便捷方法
  const playAudio = useCallback(async (audioUrl: string) => {
    await load(audioUrl);
    await play();
  }, [load, play]);

  return {
    ...state,
    play,
    pause,
    stop,
    setVolume,
    seek,
    load,
    playAudio, // 新增的便捷方法
    error,
    audioRef,
  };
}