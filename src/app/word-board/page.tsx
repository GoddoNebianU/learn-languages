'use client';
import WordBoard from "@/app/word-board/WordBoard";
import Button from "../../components/Button";
import { useRef, useState } from "react";
import Word from "@/interfaces/Word";

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputFileRef = useRef<HTMLInputElement>(null);
  const initialWords =
    [
      // 'apple',
      // 'banana',
      // 'cannon',
      // 'desktop',
      // 'kernel',
      // 'system',
      // 'programming',
      // 'owe'
    ] as Array<string>;
  const [words, setWords] = useState(
    initialWords.map((v: string) => ({
      'word': v,
      'x': Math.random(),
      'y': Math.random()
    }))
  );
  const generateNewWord = (word: string) => {
    return {
      word: word,
      x: Math.random(),
      y: Math.random()
    } as Word;
  }
  const insertWord = () => {
    if (!inputRef.current) return;
    const word = inputRef.current.value.trim();
    if (word === '') return;
    setWords([...words, generateNewWord(word)]);
    inputRef.current.value = '';
  }
  const deleteWord = () => {
    if (!inputRef.current) return;
    const word = inputRef.current.value.trim();
    if (word === '') return;
    setWords(words.filter((v) => v.word !== word));
    inputRef.current.value = '';
  };
  const importWords = () => {
    inputFileRef.current?.click();
  }
  const exportWords = () => {
    const blob = new Blob([JSON.stringify(words)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${Date.now()}.json`;
    a.style.display = 'none';
    a.click();
    URL.revokeObjectURL(url);
  }
  const handleFileChange = () => {
    const files = inputFileRef.current?.files;
    if (files && files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result && typeof reader.result === 'string')
          setWords(JSON.parse(reader.result) as [Word]);
      }
      reader.readAsText(files[0]);
    }
  }
  return (
    <div className="p-5 my-10 mx-auto bg-gray-200 rounded shadow-2xl w-[1050px]">
      <WordBoard words={words as [Word]} setWords={setWords} />
      <div className="flex justify-center rounded mt-3 w-[1000px]">
        <input ref={inputRef} placeholder="在此插入/删除单词" type="text" className="focus:outline-none border-b-2 border-black" />
        <Button label="插入" onClick={insertWord}></Button>
        <Button label="删除" onClick={deleteWord}></Button>
        <Button label="导入" onClick={importWords}></Button>
        <Button label="导出" onClick={exportWords}></Button>
        <Button label="删光" onClick={()=>{setWords([] as Array<Word>)}}></Button>
      </div>
      <input type="file" ref={inputFileRef} className="hidden" accept="application/json" onChange={handleFileChange}></input>
    </div>
  );
}
