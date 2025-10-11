"use client";

import Button from "@/components/Button";
import IconClick from "@/components/IconClick";
import IMAGES from "@/config/images";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { getTTSAudioUrl } from "@/utils";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import z from "zod";

export default function Home() {
    const [showSpeedAdjust, setShowSpeedAdjust] = useState(false);
    const [ipaEnabled, setIPAEnabled] = useState(false);
    const [speed, setSpeed] = useState(1);
    const [pause, setPause] = useState(true);
    const [autopause, setAutopause] = useState(true);
    const textRef = useRef('');
    // const localeRef = useRef<string | null>(null);
    const [locale, setLocale] = useState<string | null>(null);
    const [ipa, setIPA] = useState<string>('');
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

        if (ipa.length === 0 && ipaEnabled && textRef.current.length !== 0) {
            const params = new URLSearchParams({
                text: textRef.current
            });
            fetch(`/api/ipa?${params}`)
                .then(res => res.json())
                .then(data => {
                    setIPA(data.ipa);
                }).catch(e => {
                    console.error(e);
                    setIPA('');
                })
        }

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
                        text: textRef.current.slice(0, 30)
                    });
                    try {
                        const textinfo = await (await fetch(`/api/locale?${params}`)).json();
                        setLocale(textinfo.locale);

                        const voice = voicesData.find(v => v.locale.startsWith(textinfo.locale));
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
                        setLocale(null);

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
        setLocale(null);
        setIPA('');
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

    const TextSpeakerItemSchema = z.object({
        text: z.string(),
        ipa: z.string().optional(),
        locale: z.string()
    });
    const TextSpeakerArraySchema = z.array(TextSpeakerItemSchema);

    const save = () => {
        if (!locale) return;

        const getTextSpeakerData = () => {
            try {
                const item = localStorage.getItem('text-speaker');

                if (!item) return [];

                const rawData = JSON.parse(item);
                const result = TextSpeakerArraySchema.safeParse(rawData);

                if (result.success) {
                    return result.data;
                } else {
                    console.error('Invalid data structure in localStorage:', result.error);
                    return [];
                }
            } catch (e) {
                console.error('Failed to parse text-speaker data:', e);
                return [];
            }
        }

        const save = getTextSpeakerData();
        const oldIndex = save.findIndex(v => v.text === textRef.current);
        if (oldIndex !== -1) {
            const oldItem = save[oldIndex];
            if ((ipa && !oldItem.ipa) || (ipa && oldItem.ipa !== ipa)) {
                oldItem.ipa = ipa;
                localStorage.setItem('text-speaker', JSON.stringify(save));
                return;
            }
        }
        if (ipa.length === 0) {
            save.push({
                text: textRef.current,
                locale: locale
            });
        } else {
            save.push({
                text: textRef.current,
                locale: locale,
                ipa: ipa
            });
        }
        localStorage.setItem('text-speaker', JSON.stringify(save));
    }

    return (<>
        <div className="my-4 p-4 mx-4 md:mx-32 border-1 border-gray-200 rounded-2xl">
            <textarea className="text-2xl resize-none focus:outline-0 min-h-64 w-full"
                onChange={handleInputChange}>
            </textarea>
            <div className="overflow-auto text-gray-600 h-18">
                {ipa}
            </div>
            <div className="w-full flex flex-row flex-wrap gap-2 justify-center items-center">
                <IconClick size={45} onClick={speak} src={
                    pause ? IMAGES.play_arrow : IMAGES.pause
                } alt="playorpause" className={`${processing ? 'bg-gray-200' : ''}`}></IconClick>
                <IconClick size={45} onClick={() => {
                    setAutopause(!autopause); if (objurlRef) { stopAudio(); } setPause(true);
                }} src={
                    autopause ? IMAGES.autoplay : IMAGES.autopause
                } alt="autoplayorpause"
                ></IconClick>
                <span>{localStorage.getItem('text-speaker')}</span>
                <IconClick size={45} onClick={() => setShowSpeedAdjust(!showSpeedAdjust)}
                    src={IMAGES.more_horiz}
                    alt="more"></IconClick>
                {locale ? (<IconClick size={45} onClick={save}
                    src={IMAGES.save}
                    alt="save"></IconClick>) : (<></>)}
                <div className="w-full flex flex-row flex-wrap gap-2 justify-center items-center">

                    <Button label="生成IPA"
                        selected={ipaEnabled}
                        onClick={() => setIPAEnabled(!ipaEnabled)}>
                    </Button>
                    <Button label="删除所有保存项"
                        onClick={() => localStorage.setItem('text-speaker', '[]')}>
                    </Button>
                    <Button label="查看保存项"
                        onClick={}>
                    </Button>
                </div>
                <div className="w-full flex flex-row flex-wrap gap-2 justify-center items-center">
                    {
                        showSpeedAdjust ? (<>
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
                        </>) : <></>
                    }
                </div>
            </div>
        </div >
    </>);
}