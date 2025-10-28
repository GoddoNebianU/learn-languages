"use client";

import { useState } from "react";
import Main from "./Main";
import Edit from "./Edit";
import Start from "./Start";

export interface WordData {
  locales: [string, string];
  wordPairs: [string, string][];
}

export default function Memorize() {
  const [page, setPage] = useState<"start" | "main" | "edit">(
    "start",
  );
  const [wordData, setWordData] = useState<WordData>({
    locales: ["en-US", "zh-CN"],
    wordPairs: [
      ['hello', '你好'],
      ['world', '世界'],
      ['brutal', '残酷的'],
      ['apple', '苹果'],
      ['banana', '香蕉'],
      ['orange', '橙子'],
      ['grape', '葡萄'],
    ]
  });
  if (page === "main")
    return <Main wordData={wordData} setPage={setPage}></Main>;
  if (page === "edit")
    return (
      <Edit
        setPage={setPage}
        wordData={wordData}
        setWordData={setWordData}
      ></Edit>
    );
  if (page === "start")
    return <Start setPage={setPage} wordData={wordData}></Start>;
}
