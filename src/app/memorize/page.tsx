"use client";

import { useState } from "react";
import Main from "./Main";
import Edit from "./Edit";
import Start from "./Start";
import { WordData } from "@/interfaces";

export default function Memorize() {
  const [page, setPage] = useState<"start" | "main" | "edit">("main");
  const [wordData, setWordData] = useState<WordData>({
    locales: ["en-US", "zh-CN"],
    wordPairs: [
      ["hello", "你好"],
      ["world", "世界"],
      ["brutal", "残酷的"],
      ["apple", "苹果"],
      ["banana", "香蕉"],
      ["orange", "橙子"],
      ["grape", "葡萄"],
      ["San Francisco", "旧金山"],
      ["New York", "纽约"],
      ["Los Angeles", "洛杉矶"],
      // ['A Very Very Very Very Very Very Very Long Word', '一个很长很长很长很长很长很长很长很长很长很长的单词']
      ["Chicago", "芝加哥"],
      ["Tokyo", "东京"],
      ["Paris", "巴黎"]
    ],
  });
  if (page === "main")
    return (
      <Main
        wordData={wordData}
        setWordData={setWordData}
        setPage={setPage}
      ></Main>
    );
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
