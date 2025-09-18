'use client';

import Word from "@/interfaces/Word";
import inspect from "@/utilities";
import { Dispatch, SetStateAction } from "react";

function DraggableWord({ word }: { word: Word }) {
    return ((<span
        style={{
            left: `${Math.floor(word.x * (1000 - 18 * word.word.length))}px`,
            top: `${Math.floor(word.y * (600 - 30))}px`,
        }}
        className={`select-none cursor-pointer absolute font-mono text-[30px] border-amber-100 border-1`}
        onClick={inspect(word.word)}>{word.word}</span>))
}

export default function WordBoard(
    { words, setWords }: {
        words: [
            {
                word: string,
                x: number,
                y: number
            }
        ],
        setWords: Dispatch<SetStateAction<Word[]>>
    }
) {
    const inspect = (word: string) => {
        const goto = (url: string) => {
            window.open(url, '_blank');
        }
        return () => {
            word = word.toLowerCase();
            goto(`https://www.youdao.com/result?word=${word}&lang=en`);
        }
    }
    return (
        <div className="relative rounded bg-white w-[1000px] h-[600px]">
            {words.map(
                (v: {
                    word: string,
                    x: number,
                    y: number
                }, i: number) => {
                    return (<DraggableWord word={v} key={i}></DraggableWord>)
                })}
        </div>
    )
}