"use client";

import Button from "@/components/Button";
import { useRef, useState } from "react";

export default function Home() {
  const respref = useRef<HTMLParagraphElement>(null);
  const inputref = useRef<HTMLTextAreaElement>(null);
  const [ipa_result, set_ipa_result] = useState<{ lang: string, ipa: string } | null>(null);
  const [genaiEnabled, setGenaiEnabled] = useState<boolean>(true);

  const generateIPA = () => {
    if (!genaiEnabled) return;
    setGenaiEnabled(false);

    const text = inputref.current!.value.trim();
    if (text.length === 0) return;

    const params = new URLSearchParams({ text: text });
    fetch(`/api/ipa?${params}`)
      .then(response => {
        if (response.ok) {
          return response.json().then((data) => {
            set_ipa_result(data);
          });
        } else {
          return response.text()
            .then(errorText => {
              console.error(errorText);
            });
        }
      })
      .finally(() => {
        setGenaiEnabled(true);
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
            className="h-8 w-128 border-gray-300 border rounded focus:outline-blue-400 focus:outline-2">
          </textarea>
        </div>
        <div className="m-2 flex-row flex gap-2">
          <Button onClick={generateIPA} label="生成IPA" disabled={!genaiEnabled}></Button>
          <Button onClick={readIPA} label="朗读"></Button>
          {/* <Button onClick={() => { setGenaiEnabled(!genaiEnabled) }} label="test"></Button> */}
        </div>
        <div ref={respref} className="whitespace-pre-line">
          语言：{ipa_result?.lang}{'\n'}
          IPA：{ipa_result?.ipa}
        </div>
      </div>
    </div>
  );
}
