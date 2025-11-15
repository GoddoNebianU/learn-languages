"use client";

import {
  BOARD_WIDTH,
  TEXT_WIDTH,
  BOARD_HEIGHT,
  TEXT_SIZE,
} from "@/config/word-board-config";
import { Word } from "@/lib/interfaces";
import { Dispatch, SetStateAction } from "react";

export default function TheBoard({
  words,
  selectWord,
}: {
  words: [
    {
      word: string;
      x: number;
      y: number;
    },
  ];
  setWords: Dispatch<SetStateAction<Word[]>>;
  selectWord: (word: string) => void;
}) {
  function DraggableWord({ word }: { word: Word }) {
    return (
      <span
        style={{
          left: `${Math.floor(word.x * (BOARD_WIDTH - TEXT_WIDTH * word.word.length))}px`,
          top: `${Math.floor(word.y * (BOARD_HEIGHT - TEXT_SIZE))}px`,
          fontSize: `${TEXT_SIZE}px`,
        }}
        className="select-none cursor-pointer absolute code-block border-amber-100 border-1"
        // onClick={inspect(word.word)}>{word.word}</span>))
        onClick={() => {
          selectWord(word.word);
        }}
      >
        {word.word}
      </span>
    );
  }
  return (
    <div
      style={{
        width: `${BOARD_WIDTH}px`,
        height: `${BOARD_HEIGHT}px`,
      }}
      className="relative rounded bg-white"
    >
      {words.map(
        (
          v: {
            word: string;
            x: number;
            y: number;
          },
          i: number,
        ) => {
          return <DraggableWord word={v} key={i}></DraggableWord>;
        },
      )}
    </div>
  );
}
