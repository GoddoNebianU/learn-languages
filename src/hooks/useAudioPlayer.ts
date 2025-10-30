import { useRef, useEffect, useState, useCallback } from "react";

type AudioPlayerError = Error | null;

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
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
      setError(new Error(target.error?.message || "Audio playback error"));
      setState((prev) => ({ ...prev, isLoading: false, isPlaying: false }));
    };

    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
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
        Math.min(audioRef.current.duration, time),
      );
      audioRef.current.currentTime = clampedTime;
      setState((prev) => ({ ...prev, currentTime: clampedTime }));
    }
  }, []);

  const load = useCallback(async (audioUrl: string) => {
    if (!audioRef.current) return;

    try {
      setError(null);
      setState((prev) => ({ ...prev, isLoading: true }));

      // Only load if URL is different
      if (audioRef.current.src !== audioUrl) {
        audioRef.current.src = audioUrl;
        await new Promise((resolve, reject) => {
          if (!audioRef.current)
            return reject(new Error("Audio element not found"));

          const handleCanPlay = () => {
            audioRef.current?.removeEventListener("canplay", handleCanPlay);
            audioRef.current?.removeEventListener("error", handleError);
            resolve(void 0);
          };

          const handleError = () => {
            audioRef.current?.removeEventListener("canplay", handleCanPlay);
            audioRef.current?.removeEventListener("error", handleError);
            reject(new Error("Failed to load audio"));
          };

          audioRef.current.addEventListener("canplay", handleCanPlay);
          audioRef.current.addEventListener("error", handleError);
        });
      }

      setState((prev) => ({ ...prev, isLoading: false }));
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to load audio");
      setError(error);
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  return {
    ...state,
    play,
    pause,
    stop,
    setVolume,
    seek,
    load,
    error,
    audioRef,
  };
}
