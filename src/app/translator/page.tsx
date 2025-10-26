"use client";

import { ChangeEvent, useEffect, useState } from "react";
import Button from "@/components/Button";
import IconClick from "@/components/IconClick";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import IMAGES from "@/config/images";
import { getTTSAudioUrl } from "@/utils";
import { Navbar } from "@/components/Navbar";
import { VOICES } from "@/config/locales";

export default function Translator() {
  const [ipaEnabled, setIPAEnabled] = useState(true);
  const [targetLang, setTargetLang] = useState('Chinese');

  const [sourceText, setSourceText] = useState('');
  const [targetText, setTargetText] = useState('');
  const [sourceIPA, setSourceIPA] = useState('');
  const [targetIPA, setTargetIPA] = useState('');
  const [sourceLocale, setSourceLocale] = useState<string | null>(null);
  const [targetLocale, setTargetLocale] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);
  const { playAudio } = useAudioPlayer();

  const tl = ['Chinese', 'English', 'Italian'];

  const inputLanguage = () => {
    const lang = prompt('Input a language.')?.trim();
    if (lang) {
      setTargetLang(lang);
    }
  }

  const translate = () => {
    if (translating) return;
    if (sourceText.length === 0) return;

    setTranslating(true);

    setTargetText('');
    setSourceLocale(null);
    setTargetLocale(null);
    setSourceIPA('');
    setTargetIPA('');

    const params = new URLSearchParams({
      text: sourceText,
      target: targetLang
    })
    fetch(`/api/translate?${params}`)
      .then(res => res.json())
      .then(obj => {
        setSourceLocale(obj.source_locale);
        setTargetLocale(obj.target_locale);
        setTargetText(obj.target_text);

        if (ipaEnabled) {
          const params = new URLSearchParams({
            text: sourceText
          });
          fetch(`/api/ipa?${params}`)
            .then(res => res.json())
            .then(data => {
              setSourceIPA(data.ipa);
            }).catch(e => {
              console.error(e);
              setSourceIPA('');
            })
          const params2 = new URLSearchParams({
            text: obj.target_text
          });
          fetch(`/api/ipa?${params2}`)
            .then(res => res.json())
            .then(data => {
              setTargetIPA(data.ipa);
            }).catch(e => {
              console.error(e);
              setTargetIPA('');
            })
        }
      }).catch(r => {
        console.error(r);
        setSourceLocale('');
        setTargetLocale('');
        setTargetText('');
      }).finally(() => setTranslating(false));
  }

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setSourceText(e.target.value.trim());
    setTargetText('');
    setSourceLocale(null);
    setTargetLocale(null);
    setSourceIPA('');
    setTargetIPA('');
  }

  const readSource = async () => {
    if (sourceText.length === 0) return;

    if (sourceIPA.length === 0 && ipaEnabled) {
      const params = new URLSearchParams({
        text: sourceText
      });
      fetch(`/api/ipa?${params}`)
        .then(res => res.json())
        .then(data => {
          setSourceIPA(data.ipa);
        }).catch(e => {
          console.error(e);
          setSourceIPA('');
        })
    }

    if (!sourceLocale) {
      try {
        const params = new URLSearchParams({
          text: sourceText.slice(0, 30)
        });
        const res = await fetch(`/api/locale?${params}`);
        const info = await res.json();
        setSourceLocale(info.locale);

        const voice = VOICES.find(v => v.locale.startsWith(info.locale));
        if (!voice) {
          return;
        }

        const url = await getTTSAudioUrl(sourceText, voice.short_name);
        await playAudio(url);
        URL.revokeObjectURL(url);
      } catch (e) {
        console.error(e);
        setSourceLocale(null);
        return;
      }
    } else {
      const voice = VOICES.find(v => v.locale.startsWith(sourceLocale!));
      if (!voice) {
        return;
      }

      const url = await getTTSAudioUrl(sourceText, voice.short_name);
      await playAudio(url);
      URL.revokeObjectURL(url);
    }
  }

  const readTarget = async () => {
    if (targetText.length === 0) return;

    if (targetIPA.length === 0 && ipaEnabled) {
      const params = new URLSearchParams({
        text: targetText
      });
      fetch(`/api/ipa?${params}`)
        .then(res => res.json())
        .then(data => {
          setTargetIPA(data.ipa);
        }).catch(e => {
          console.error(e);
          setTargetIPA('');
        })
    }

    const voice = VOICES.find(v => v.locale.startsWith(targetLocale!));
    if (!voice) return;

    const url = await getTTSAudioUrl(targetText, voice.short_name);
    await playAudio(url);
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <Navbar></Navbar>
      <div className="w-screen flex flex-col md:flex-row md:justify-between gap-2 p-2">
        <div className="card1 w-full md:w-1/2 flex flex-col-reverse gap-2">
          <div className="textarea1 border-1 border-gray-200 rounded-2xl w-full h-64 p-2">
            <textarea onChange={handleInputChange} className="resize-none h-8/12 w-full focus:outline-0"></textarea>
            <div className="ipa w-full h-2/12 overflow-auto text-gray-600">
              {sourceIPA}
            </div>
            <div className="h-2/12 w-full flex justify-end items-center">
              <IconClick onClick={async () => {
                if (sourceText.length !== 0)
                  await navigator.clipboard.writeText(sourceText);
              }} src={IMAGES.copy_all} alt="copy"></IconClick>
              <IconClick onClick={readSource} src={IMAGES.play_arrow} alt="play"></IconClick>
            </div>
          </div>
          <div className="option1 w-full flex flex-row justify-between items-center">
            <span>detect language</span>
            <Button selected={ipaEnabled} onClick={() => setIPAEnabled(!ipaEnabled)}>generate ipa</Button>
          </div>
        </div>
        <div className="card2 w-full md:w-1/2 flex flex-col-reverse gap-2">
          <div className="textarea2 bg-gray-100 rounded-2xl w-full h-64 p-2">
            <div className="h-8/12 w-full">{
              targetText
            }</div>
            <div className="ipa w-full h-2/12 overflow-auto text-gray-600">
              {targetIPA}
            </div>
            <div className="h-2/12 w-full flex justify-end items-center">
              <IconClick onClick={async () => {
                if (targetText.length !== 0)
                  await navigator.clipboard.writeText(targetText);
              }} src={IMAGES.copy_all} alt="copy"></IconClick>
              <IconClick onClick={readTarget} src={IMAGES.play_arrow} alt="play"></IconClick>
            </div>
          </div>
          <div className="option2 w-full flex gap-1 items-center flex-wrap">
            <span>translate into</span>
            <Button onClick={() => { setTargetLang('Chinese') }} selected={targetLang === 'Chinese'}>Chinese</Button>
            <Button onClick={() => { setTargetLang('English') }} selected={targetLang === 'English'}>English</Button>
            <Button onClick={() => { setTargetLang('Italian') }} selected={targetLang === 'Italian'}>Italian</Button>
            <Button onClick={inputLanguage} selected={!(tl.includes(targetLang))}>{'Other' + (tl.includes(targetLang) ? '' : ': ' + targetLang)}</Button>
          </div>
        </div>
      </div>

      <div className="button-area w-screen flex justify-center items-center">
        <button onClick={translate} className={`duration-150 ease-in text-xl font-extrabold border rounded-4xl p-3 border-gray-200 h-16 ${translating ? 'bg-gray-200' : 'bg-white hover:bg-gray-200 hover:cursor-pointer'}`}>
          {translating ? 'translating...' : 'translate'}
        </button>
      </div>
    </>
  );
}
