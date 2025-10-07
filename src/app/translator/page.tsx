"use client";

import { ChangeEvent, useEffect, useState } from "react";
import Button from "@/components/Button";
import IconClick from "@/components/IconClick";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import IMAGES from "@/config/images";
import { getTTSAudioUrl } from "@/utils";

export default function Home() {
  const [voicesData, setVoicesData] = useState<{
    locale: string,
    short_name: string
  }[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [targetLang, setTargetLang] = useState('Italian');
  const nullTextInfo = {
    source: {
      text: null,
      language: null,
      ipa: null,
      locale: null
    },
    target: {
      text: null,
      language: null,
      ipa: null,
      locale: null
    }
  };
  const [textInfo, setTextInfo] = useState<{
    source: {
      text: string | null,
      language: string | null,
      ipa: string | null,
      locale: string | null
    },
    target: {
      text: string | null,
      language: string | null,
      ipa: string | null,
      locale: string | null
    }
  }>(nullTextInfo);
  const [translating, setTranslating] = useState(false);
  const { playAudio } = useAudioPlayer();

  useEffect(() => {
    fetch('/list_of_voices.json')
      .then(res => res.json())
      .then(setVoicesData)
      .catch(() => setVoicesData(null))
      .finally(() => setLoading(false));
  }, []);
  if (loading) return <div>加载中...</div>;
  if (!voicesData) return <div>加载失败</div>;

  const tl = ['English', 'Italian', 'Japanese'];

  const inputLanguage = () => {
    const lang = prompt('Input a language.')?.trim();
    if (lang) {
      setTargetLang(lang);
    }
  }

  const translate = () => {
    if (translating) return;
    if (!textInfo.source.text || textInfo.source.text.length === 0) return;

    setTranslating(true);

    const params = new URLSearchParams({
      text: textInfo.source.text,
      target: targetLang
    })
    fetch(`/api/translate?${params}`)
      .then(res => res.json())
      .then(setTextInfo)
      .finally(() => setTranslating(false));
  }

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setTextInfo({
      source: {
        text: e.target.value.trim(),
        language: null,
        ipa: null,
        locale: null
      },
      target: {
        text: null,
        language: null,
        ipa: null,
        locale: null
      }
    });
  }

  const readSource = async () => {
    if (!textInfo.source.text || textInfo.source.text.length === 0) return;

    if (!textInfo.source.locale) {
      const params = new URLSearchParams({ text: textInfo.source.text });
      const res = await fetch(`/api/textinfo?${params}`);
      const info = await res.json();
      setTextInfo(
        {
          source: info,
          target: { ...textInfo.target }
        }
      );
    }
    const voice = voicesData.find(v => v.locale.startsWith(textInfo.source.locale!));
    if (!voice) {
      return;
    }

    const url = await getTTSAudioUrl(textInfo.source.text, voice.short_name);
    await playAudio(url);
    URL.revokeObjectURL(url);
  }

  const readTarget = async () => {
    if (!textInfo.target.text || textInfo.target.text.length === 0) return;

    const voice = voicesData.find(v => v.locale.startsWith(textInfo.target.locale!));
    if (!voice) return;

    const url = await getTTSAudioUrl(textInfo.target.text, voice.short_name);
    await playAudio(url);
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className="w-screen flex flex-col md:flex-row md:justify-between gap-2 p-2">
        <div className="card1 w-full md:w-1/2 flex flex-col-reverse gap-2">
          <div className="textarea1 border-1 border-gray-200 rounded-2xl w-full h-64 p-2">
            <textarea onChange={handleInputChange} className="resize-none h-8/12 w-full focus:outline-0"></textarea>
            <div className="ipa w-full h-2/12 overflow-auto text-gray-600">
              {textInfo.source.ipa || ''}
            </div>
            <div className="h-2/12 w-full flex justify-end items-center">
              <IconClick onClick={async () => {
                if (textInfo.source.text && textInfo.source.text.length !== 0)
                  await navigator.clipboard.writeText(textInfo.source.text);
              }} src={IMAGES.copy_all} alt="copy"></IconClick>
              <IconClick onClick={readSource} src={IMAGES.play_arrow} alt="play"></IconClick>
            </div>
          </div>
          <div className="option1 w-full">
            <span>detect language</span>
          </div>
        </div>
        <div className="card2 w-full md:w-1/2 flex flex-col-reverse gap-2">
          <div className="textarea2 bg-gray-100 rounded-2xl w-full h-64 p-2">
            <div className="h-8/12 w-full">{
              textInfo.target.text || ''
            }</div>
            <div className="ipa w-full h-2/12 overflow-auto text-gray-600">
              {textInfo.target.ipa || ''}
            </div>
            <div className="h-2/12 w-full flex justify-end items-center">
              <IconClick onClick={async () => {
                if (textInfo.target.text && textInfo.target.text.length !== 0)
                  await navigator.clipboard.writeText(textInfo.target.text);
              }} src={IMAGES.copy_all} alt="copy"></IconClick>
              <IconClick onClick={readTarget} src={IMAGES.play_arrow} alt="play"></IconClick>
            </div>
          </div>
          <div className="option2 w-full flex gap-1 items-center flex-wrap">
            <span>translate into</span>
            <Button onClick={() => { setTargetLang('English') }} label="English" selected={targetLang === 'English'}></Button>
            <Button onClick={() => { setTargetLang('Italian') }} label="Italian" selected={targetLang === 'Italian'}></Button>
            <Button onClick={() => { setTargetLang('Japanese') }} label="Japanese" selected={targetLang === 'Japanese'}></Button>
            <Button onClick={inputLanguage} label={'Other' + (tl.includes(targetLang) ? '' : ': ' + targetLang)} selected={!(tl.includes(targetLang))}></Button>
          </div>
        </div>
      </div>

      <div className="button-area w-screen flex justify-center items-center">
        <button onClick={translate} className={`text-xl font-extrabold border rounded-4xl p-3 border-gray-200 h-16 ${translating ? 'bg-gray-200' : 'bg-white hover:bg-gray-200 hover:cursor-pointer'}`}>
          {translating ? 'translating...' : 'translate'}
        </button>
      </div>
    </>
  );
}
