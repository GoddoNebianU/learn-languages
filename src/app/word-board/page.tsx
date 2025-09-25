'use client';
import WordBoard from "@/app/word-board/WordBoard";
import Button from "../../components/Button";
import { KeyboardEvent, useRef, useState } from "react";
import Word from "@/interfaces/Word";
import { BOARD_WIDTH, TEXT_WIDTH, BOARD_HEIGHT, TEXT_SIZE } from "@/constants";
import { inspect } from "@/utilities";

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
    const isOK = (w: Word) => {
      if (words.length === 0) return true;
      const tf = (ww: Word) => ({
        word: ww.word,
        x: Math.floor(ww.x * (BOARD_WIDTH - TEXT_WIDTH * ww.word.length)),
        y: Math.floor(ww.y * (BOARD_HEIGHT - TEXT_SIZE))
      } as Word);
      const tfd_words = words.map(tf);
      const tfd_w = tf(w);
      for (const www of tfd_words) {
        const p1 = {
          x: (www.x + www.x + TEXT_WIDTH * www.word.length) / 2,
          y: (www.y + www.y + TEXT_SIZE) / 2
        }
        const p2 = {
          x: (tfd_w.x + tfd_w.x + TEXT_WIDTH * tfd_w.word.length) / 2,
          y: (tfd_w.y + tfd_w.y + TEXT_SIZE) / 2
        }
        if (
          Math.abs(p1.x - p2.x) < (TEXT_WIDTH * (www.word.length + tfd_w.word.length)) / 2 &&
          Math.abs(p1.y - p2.y) < TEXT_SIZE
        ) {
          return false;
        }
      }
      return true;
    }
    let new_word;
    let count = 0;
    do {
      new_word = {
        word: word,
        x: Math.random(),
        y: Math.random()
      };
      if (++count > 1000) return null;
    } while (!isOK(new_word));
    return new_word as Word;
  }
  const insertWord = () => {
    if (!inputRef.current) return;
    const word = inputRef.current.value.trim();
    if (word === '') return;
    const new_word = generateNewWord(word);
    if (!new_word) return;
    setWords([...words, new_word]);
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
  const deleteAll = () => {
    setWords([] as Array<Word>);
  }
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    // e.preventDefault();
    if (e.key === 'Enter') {
      insertWord();
    }
  }
  const selectWord = (word: string) => {
    if (!inputRef.current) return;
    inputRef.current.value = word;
  }
  const searchWord = () => {
    if (!inputRef.current) return;
    const word = inputRef.current.value.trim();
    if (word === '') return;
    inspect(word)();
    inputRef.current.value = '';
  }
  // const readWordAloud = () => {
  //   playFromUrl('https://fanyi.baidu.com/gettts?lan=uk&text=disclose&spd=3')
  //   return;
  //   if (!inputRef.current) return;
  //   const word = inputRef.current.value.trim();
  //   if (word === '') return;
  //   inspect(word)();
  //   inputRef.current.value = '';
  // }
  return (
    <div onKeyDown={handleKeyDown} className="p-5 my-10 mx-auto bg-gray-200 rounded shadow-2xl w-[1050px]">
      <WordBoard selectWord={selectWord} words={words as [Word]} setWords={setWords} />
      <div className="flex justify-center rounded mt-3 w-[1000px]">
        <input ref={inputRef} placeholder="word to operate" type="text" className="focus:outline-none border-b-2 border-black" />
        <Button label="插入" onClick={insertWord}></Button>
        <Button label="删除" onClick={deleteWord}></Button>
        <Button label="搜索" onClick={searchWord}></Button>
        <Button label="导入" onClick={importWords}></Button>
        <Button label="导出" onClick={exportWords}></Button>
        <Button label="删光" onClick={deleteAll}></Button>
        {/* <Button label="朗读" onClick={readWordAloud}></Button> */}
      </div>
      <input type="file" ref={inputFileRef} className="hidden" accept="application/json" onChange={handleFileChange}></input>
    </div>
  );
}
