"use client";

import IconClick from "@/components/IconClick";
import IMAGES from "@/config/images";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { getTTSAudioUrl } from "@/utils";
import { ChangeEvent, useEffect, useRef, useState } from "react";

export default function Home() {
    const [speed, setSpeed] = useState(1);
    const [pause, setPause] = useState(true);
    const [autopause, setAutopause] = useState(true);
    const textRef = useRef('');
    const localeRef = useRef<string | null>(null);
    const [ipa, setIPA] = useState<string | null>(null);
    const objurlRef = useRef<string | null>(null);
    const [processing, setProcessing] = useState(false);

    const [voicesData, setVoicesData] = useState<{
        locale: string,
        short_name: string
    }[] | null>(null);
    const [loading, setLoading] = useState(true);
    const { playAudio, stopAudio, audioRef } = useAudioPlayer();
    useEffect(() => {
        fetch('/list_of_voices.json')
            .then(res => res.json())
            .then(setVoicesData)
            .catch(() => setVoicesData(null))
            .finally(() => setLoading(false));
    }, []);
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleEnded = () => {
            if (autopause) {
                setPause(true);
            } else {
                playAudio(objurlRef.current!);
            }
        }
        audio.addEventListener('ended', handleEnded);
        return () => {
            audio.removeEventListener('ended', handleEnded);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [audioRef, autopause]);


    if (loading) return <div>加载中...</div>;
    if (!voicesData) return <div>加载失败</div>;


    const speak = async () => {
        if (processing) return;
        setProcessing(true);

        if (pause) {
            // 如果没在读
            if (textRef.current.length === 0) {
                // 没文本咋读
            } else {
                setPause(false);

                if (objurlRef.current) {
                    // 之前有播放
                    playAudio(objurlRef.current);
                } else {
                    // 第一次播放
                    console.log('downloading text info');
                    const params = new URLSearchParams({
                        text: textRef.current
                    });
                    try {
                        const textinfo = await (await fetch(`/api/textinfo?${params}`)).json();
                        localeRef.current = textinfo.locale;
                        setIPA(textinfo.ipa);

                        const voice = voicesData.find(v => v.locale.startsWith(localeRef.current!));
                        if (!voice) throw 'Voice not found.';

                        objurlRef.current = await getTTSAudioUrl(
                            textRef.current,
                            voice.short_name,
                            (() => {
                                if (speed === 1) return {};
                                else if (speed < 1) return {
                                    rate: `-${100 - speed * 100}%`
                                }; else return {
                                    rate: `+${speed * 100 - 100}%`
                                };
                            })()
                        );
                        playAudio(objurlRef.current);
                    } catch (e) {
                        console.error(e);

                        setPause(true);
                        localeRef.current = null;
                        setIPA(null);

                        setProcessing(false);
                    }
                }
            }
        } else {
            // 如果在读就暂停
            setPause(true);
            stopAudio();
        }

        setProcessing(false);
    }

    const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        textRef.current = e.target.value.trim();
        localeRef.current = null;
        setIPA(null);
        if (objurlRef.current) URL.revokeObjectURL(objurlRef.current);
        objurlRef.current = null;
        stopAudio();
        setPause(true);
    }

    const letMeSetSpeed = (new_speed: number) => {
        return () => {
            setSpeed(new_speed);
            if (objurlRef.current) URL.revokeObjectURL(objurlRef.current);
            objurlRef.current = null;
            stopAudio();
            setPause(true);
        }
    }

    return (<>
        <div className="my-4 p-4 mx-4 md:mx-32 border-1 border-gray-200 rounded-2xl">
            <textarea className="text-2xl resize-none focus:outline-0 min-h-64 w-full"
                onChange={handleInputChange}>
            </textarea>
            <div className="overflow-auto text-gray-600 h-18">
                {ipa}
            </div>
            <div className="w-full flex flex-row gap-2 justify-center items-center">
                <IconClick size={45} onClick={() => {
                    setAutopause(!autopause); if (objurlRef) { stopAudio(); } setPause(true);
                }} src={
                    autopause ? IMAGES.autoplay : IMAGES.autopause
                } alt="autoplayorpause"
                ></IconClick>
                <IconClick size={45} onClick={speak} src={
                    pause ? IMAGES.play_arrow : IMAGES.pause
                } alt="playorpause" className={`${processing ? 'bg-gray-200' : ''}`}></IconClick>
                <IconClick size={45} onClick={letMeSetSpeed(0.5)}
                    src={IMAGES.speed_0_5x}
                    alt="0.5x"
                    className={speed === 0.5 ? 'bg-gray-200' : ''}
                ></IconClick>
                <IconClick size={45} onClick={letMeSetSpeed(0.7)}
                    src={IMAGES.speed_0_7x}
                    alt="0.7x"
                    className={speed === 0.7 ? 'bg-gray-200' : ''}
                ></IconClick>
                <IconClick size={45} onClick={letMeSetSpeed(1)}
                    src={IMAGES.speed_1x}
                    alt="1x"
                    className={speed === 1 ? 'bg-gray-200' : ''}
                ></IconClick>
                <IconClick size={45} onClick={letMeSetSpeed(1.2)}
                    src={IMAGES.speed_1_2_x}
                    alt="1.2x"
                    className={speed === 1.2 ? 'bg-gray-200' : ''}
                ></IconClick>
                <IconClick size={45} onClick={letMeSetSpeed(1.5)}
                    src={IMAGES.speed_1_5x}
                    alt="1.5x"
                    className={speed === 1.5 ? 'bg-gray-200' : ''}
                ></IconClick>
            </div>
        </div >
    </>);
}