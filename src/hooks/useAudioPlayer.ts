import { useRef, useEffect } from "react";


export function useAudioPlayer() {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    useEffect(() => {
        audioRef.current = new Audio();
        return () => {
            audioRef.current!.pause();
            audioRef.current = null;
        };
    }, []);
    const playAudio = async (audioUrl: string) => {
        audioRef.current!.src = audioUrl;
        try {
            await audioRef.current!.play();
        } catch (e) {
            return e;
        }
    };
    const pauseAudio = () => {
        audioRef.current!.pause();
    };
    const stopAudio = () => {
        audioRef.current!.pause();
        audioRef.current!.currentTime = 0;
    };
    return {
        playAudio,
        pauseAudio,
        stopAudio,
        audioRef
    };
}
