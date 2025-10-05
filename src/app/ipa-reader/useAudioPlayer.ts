import { useRef, useEffect } from "react";

export default function useAudioPlayer() {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    useEffect(() => {
        audioRef.current = new Audio();

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);
    const playAudio = (audioUrl: string) => {
        if (audioRef.current) {
            audioRef.current.src = audioUrl;
            audioRef.current.play().catch(error => {
                console.error('播放失败:', error);
            });
        }
    };
    const pauseAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
        }
    };
    const stopAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    };
    return {
        playAudio,
        pauseAudio,
        stopAudio
    };
};