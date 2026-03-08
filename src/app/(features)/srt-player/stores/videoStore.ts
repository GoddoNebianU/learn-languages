import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface VideoStore {
    videoRef?: React.RefObject<HTMLVideoElement | null>;
    currentSrc: string | null;
    loaded: boolean;
    onTimeUpdate: (time: number) => void;
    setOnTimeUpdate: (handler: (time: number) => void) => void;
    setVideoRef: (ref?: React.RefObject<HTMLVideoElement | null>) => void;
    loadVideo: (url: string, options?: { autoplay?: boolean; muted?: boolean; }) => void;
    play: () => void;
    pause: () => void;
    togglePlay: () => void;
    seekTo: (time: number) => void;
    setVolume: (vol: number) => void;
    getCurrentTime: () => number | undefined;
    getDuration: () => number | undefined;
    isPlaying: () => boolean;
}

export const useVideoStore = create<VideoStore>()(
    devtools((set, get) => ({
        videoRef: null,
        currentSrc: null,
        loaded: false,
        onTimeUpdate: (time) => { },
        setOnTimeUpdate: (handler) => {
            set({ onTimeUpdate: handler });
        },
        setVideoRef: (ref) => {
            set({ videoRef: ref });
            ref?.current?.addEventListener("timeupdate", () => {
                const currentTime = get().videoRef?.current?.currentTime;
                if (currentTime !== undefined) {
                    get().onTimeUpdate(currentTime);
                }
            });
        },
        loadVideo: (url: string, options = { autoplay: false, muted: false }) => {
            const { videoRef } = get();
            const video = videoRef?.current;

            if (!url) {
                console.warn('loadVideo: empty url provided');
                return;
            }

            if (!video) {
                console.debug('loadVideo: video ref not ready yet');
                return;
            }

            try {
                video.pause();
                video.currentTime = 0;
                video.src = url;
                if (options.autoplay) {
                    video
                        .play()
                        .then(() => {
                            console.debug('Auto play succeeded after src change');
                        })
                        .catch((err) => {
                            console.warn('Auto play failed after src change:', err);
                        });
                }
                set({ currentSrc: url, loaded: true });
            } catch (err) {
                console.error('Failed to load video:', err);
                set({ loaded: false });
            }
        },

        play: () => {
            const video = get().videoRef?.current;
            if (video) video.play().catch(() => { });
        },

        pause: () => {
            const video = get().videoRef?.current;
            if (video) video.pause();
        },

        togglePlay: () => {
            const video = get().videoRef?.current;
            if (!video) return;
            if (video.paused) {
                video.play().catch(() => { });
            } else {
                video.pause();
            }
        },

        seekTo: (time: number) => {
            const video = get().videoRef?.current;
            if (video) video.currentTime = time;
        },

        setVolume: (vol: number) => {
            const video = get().videoRef?.current;
            if (video) video.volume = Math.max(0, Math.min(1, vol));
        },
        getCurrentTime: () => get().videoRef?.current?.currentTime,
        getDuration: () => get().videoRef?.current?.duration,
        isPlaying: () => {
            const video = get().videoRef?.current;
            if (!video) return false;
            return !video.paused && !video.ended && video.readyState > 2;
        }
    }))
);