"use client";

import LightButton from "@/components/buttons/LightButton";
import IconClick from "@/components/IconClick";
import IMAGES from "@/config/images";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import {
  getTextSpeakerData,
  getTTSAudioUrl,
  setTextSpeakerData,
} from "@/utils";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import SaveList from "./SaveList";
import { TextSpeakerItemSchema } from "@/interfaces";
import z from "zod";
import { Navbar } from "@/components/Navbar";
import { VOICES } from "@/config/locales";

export default function TextSpeaker() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showSpeedAdjust, setShowSpeedAdjust] = useState(false);
  const [showSaveList, setShowSaveList] = useState(false);
  const [saving, setSaving] = useState(false);
  const [ipaEnabled, setIPAEnabled] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [pause, setPause] = useState(true);
  const [autopause, setAutopause] = useState(true);
  const textRef = useRef("");
  const [locale, setLocale] = useState<string | null>(null);
  const [ipa, setIPA] = useState<string>("");
  const objurlRef = useRef<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const { playAudio, stopAudio, audioRef } = useAudioPlayer();
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      if (autopause) {
        setPause(true);
      } else {
        playAudio(objurlRef.current!);
      }
    };
    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("ended", handleEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioRef, autopause]);

  const speak = async () => {
    if (processing) return;
    setProcessing(true);

    if (ipa.length === 0 && ipaEnabled && textRef.current.length !== 0) {
      const params = new URLSearchParams({
        text: textRef.current,
      });
      fetch(`/api/ipa?${params}`)
        .then((res) => res.json())
        .then((data) => {
          setIPA(data.ipa);
        })
        .catch((e) => {
          console.error(e);
          setIPA("");
        });
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
          try {
            let theLocale = locale;
            if (!theLocale) {
              console.log("downloading text info");
              const params = new URLSearchParams({
                text: textRef.current.slice(0, 30),
              });
              const textinfo = await (
                await fetch(`/api/locale?${params}`)
              ).json();
              setLocale(textinfo.locale);
              theLocale = textinfo.locale as string;
            }

            const voice = VOICES.find((v) => v.locale.startsWith(theLocale));
            if (!voice) throw "Voice not found.";

            objurlRef.current = await getTTSAudioUrl(
              textRef.current,
              voice.short_name,
              (() => {
                if (speed === 1) return {};
                else if (speed < 1)
                  return {
                    rate: `-${100 - speed * 100}%`,
                  };
                else
                  return {
                    rate: `+${speed * 100 - 100}%`,
                  };
              })(),
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
  };

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    textRef.current = e.target.value.trim();
    setLocale(null);
    setIPA("");
    if (objurlRef.current) URL.revokeObjectURL(objurlRef.current);
    objurlRef.current = null;
    stopAudio();
    setPause(true);
  };

  const letMeSetSpeed = (new_speed: number) => {
    return () => {
      setSpeed(new_speed);
      if (objurlRef.current) URL.revokeObjectURL(objurlRef.current);
      objurlRef.current = null;
      stopAudio();
      setPause(true);
    };
  };

  const handleUseItem = (item: z.infer<typeof TextSpeakerItemSchema>) => {
    if (textareaRef.current) textareaRef.current.value = item.text;
    textRef.current = item.text;
    setLocale(item.locale);
    setIPA(item.ipa || "");
    if (objurlRef.current) URL.revokeObjectURL(objurlRef.current);
    objurlRef.current = null;
    stopAudio();
    setPause(true);
  };

  const save = async () => {
    if (saving) return;
    if (textRef.current.length === 0) return;

    setSaving(true);

    try {
      let theLocale = locale;
      if (!theLocale) {
        console.log("downloading text info");
        const params = new URLSearchParams({
          text: textRef.current.slice(0, 30),
        });
        const textinfo = await (await fetch(`/api/locale?${params}`)).json();
        setLocale(textinfo.locale);
        theLocale = textinfo.locale as string;
      }

      let theIPA = ipa;
      if (ipa.length === 0 && ipaEnabled) {
        const params = new URLSearchParams({
          text: textRef.current,
        });
        const tmp = await (await fetch(`/api/ipa?${params}`)).json();
        setIPA(tmp.ipa);
        theIPA = tmp.ipa;
      }

      const save = getTextSpeakerData();
      const oldIndex = save.findIndex((v) => v.text === textRef.current);
      if (oldIndex !== -1) {
        const oldItem = save[oldIndex];
        if (theIPA) {
          if (!oldItem.ipa || oldItem.ipa !== theIPA) {
            oldItem.ipa = theIPA;
            setTextSpeakerData(save);
          }
        }
      } else if (theIPA.length === 0) {
        save.push({
          text: textRef.current,
          locale: theLocale,
        });
      } else {
        save.push({
          text: textRef.current,
          locale: theLocale,
          ipa: theIPA,
        });
      }
      setTextSpeakerData(save);
    } catch (e) {
      console.error(e);
      setLocale(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Navbar></Navbar>
      <div
        className="my-4 p-4 mx-4 md:mx-32 border-1 border-gray-200 rounded-2xl"
        style={{ fontFamily: "Times New Roman, serif" }}
      >
        <textarea
          className="text-2xl resize-none focus:outline-0 min-h-64 w-full border-gray-200 border-b"
          onChange={handleInputChange}
          ref={textareaRef}
        ></textarea>
        {(ipa.length !== 0 && (
          <div className="overflow-auto text-gray-600 h-18 border-gray-200 border-b">
            {ipa}
          </div>
        )) || <div className="h-18"></div>}
        <div className="mt-8 relative w-full flex flex-row flex-wrap gap-2 justify-center items-center">
          {showSpeedAdjust && (
            <div className="bg-white p-6 rounded-2xl border-gray-200 border-2 shadow-2xl absolute left-1/2 -translate-x-1/2 -translate-y-full -top-4 flex flex-row flex-wrap gap-2 justify-center items-center">
              <IconClick
                size={45}
                onClick={letMeSetSpeed(0.5)}
                src={IMAGES.speed_0_5x}
                alt="0.5x"
                className={speed === 0.5 ? "bg-gray-200" : ""}
              ></IconClick>
              <IconClick
                size={45}
                onClick={letMeSetSpeed(0.7)}
                src={IMAGES.speed_0_7x}
                alt="0.7x"
                className={speed === 0.7 ? "bg-gray-200" : ""}
              ></IconClick>
              <IconClick
                size={45}
                onClick={letMeSetSpeed(1)}
                src={IMAGES.speed_1x}
                alt="1x"
                className={speed === 1 ? "bg-gray-200" : ""}
              ></IconClick>
              <IconClick
                size={45}
                onClick={letMeSetSpeed(1.2)}
                src={IMAGES.speed_1_2_x}
                alt="1.2x"
                className={speed === 1.2 ? "bg-gray-200" : ""}
              ></IconClick>
              <IconClick
                size={45}
                onClick={letMeSetSpeed(1.5)}
                src={IMAGES.speed_1_5x}
                alt="1.5x"
                className={speed === 1.5 ? "bg-gray-200" : ""}
              ></IconClick>
            </div>
          )}
          <IconClick
            size={45}
            onClick={speak}
            src={pause ? IMAGES.play_arrow : IMAGES.pause}
            alt="playorpause"
            className={`${processing ? "bg-gray-200" : ""}`}
          ></IconClick>
          <IconClick
            size={45}
            onClick={() => {
              setAutopause(!autopause);
              if (objurlRef) {
                stopAudio();
              }
              setPause(true);
            }}
            src={autopause ? IMAGES.autoplay : IMAGES.autopause}
            alt="autoplayorpause"
          ></IconClick>
          <IconClick
            size={45}
            onClick={() => setShowSpeedAdjust(!showSpeedAdjust)}
            src={IMAGES.speed}
            alt="speed"
            className={`${showSpeedAdjust ? "bg-gray-200" : ""}`}
          ></IconClick>
          <IconClick
            size={45}
            onClick={save}
            src={IMAGES.save}
            alt="save"
            className={`${saving ? "bg-gray-200" : ""}`}
          ></IconClick>
          <div className="w-full flex flex-row flex-wrap gap-2 justify-center items-center">
            <LightButton
              selected={ipaEnabled}
              onClick={() => setIPAEnabled(!ipaEnabled)}
            >
              生成IPA
            </LightButton>
            <LightButton
              onClick={() => {
                setShowSaveList(!showSaveList);
              }}
              selected={showSaveList}
            >
              查看保存项
            </LightButton>
          </div>
        </div>
      </div>
      <SaveList show={showSaveList} handleUse={handleUseItem}></SaveList>
    </>
  );
}
