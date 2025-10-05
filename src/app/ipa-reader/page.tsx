"use client";

import Button from "@/components/Button";
import { useRef, useState } from "react";

export default function Home() {
  const respref = useRef<HTMLParagraphElement>(null);
  const inputref = useRef<HTMLTextAreaElement>(null);
  const [reqEnabled, setReqEnabled] = useState<boolean>(true);

  const generateIPA = () => {
    if (!reqEnabled) return;
    setReqEnabled(false);

    respref.current!.innerText = '生成国际音标中，请稍等～';
    let timer: NodeJS.Timeout;
    (() => {
      let count = 0;
      timer = setInterval(() => {
        respref.current!.innerText = '正在生成国际音标（IPA），请稍等～';
        respref.current!.innerText += `\n(waiting for ${++count}s)`
      }, 1000);
    })();

    const text = inputref.current!.value.trim();
    if (text.length === 0) return;

    const params = new URLSearchParams({ text: text });
    fetch(`/api/ipa?${params}`)
      .then(response => {
        if (!response.ok) {
          return response.json().then(resj => {
            throw new Error(`HTTP ${response.status}: ${resj.error} ${resj.message}`);
          })
        }
        return response.json();
      })
      .then(data => {
        respref.current!.innerText = `LANG: ${data.lang}\nIPA: ${data.ipa}`;
      })
      .catch(error => {
        respref.current!.innerText = `错误: ${error.message}`;
      })
      .finally(() => {
        setReqEnabled(true);
        clearInterval(timer);
      });
  }
  const readIPA = () => {
    const text = inputref.current!.value.trim();
    if (text.length === 0) return;
    // urlGoto(`https://fanyi.baidu.com/gettts?lan=uk&text=${text}&spd=3`);
    respref.current!.innerText = '暂不支持朗读';
  }
  return (
    <div className="flex w-screen justify-center">
      <div className="mt-8 bg-gray-100 shadow-xl rounded-xl p-4 flex items-center flex-col">
        <h1 className="text-5xl mb-4">IPA Reader</h1>
        <div className="flex flex-row">
          <textarea ref={inputref}
            placeholder="输入任意语言的文本"
            className="w-64 h-32 border-gray-300 border rounded focus:outline-blue-400 focus:outline-2">
          </textarea>
        </div>
        <div className="m-2 flex-row flex gap-2">
          <Button onClick={generateIPA} label="生成IPA"></Button>
          <Button onClick={readIPA} label="朗读"></Button>
        </div>
        <div ref={respref} className="whitespace-pre-line w-64"></div>
      </div>
    </div>
  );
}
