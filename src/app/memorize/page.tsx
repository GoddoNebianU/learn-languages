"use client";

import { useState } from "react";
import Main from "./Main";
import Edit from "./Edit";
import Start from "./Start";
import { WordData, WordDataSchema } from "@/lib/interfaces";

const getLocalWordData = (): WordData => {
  const data = localStorage.getItem("wordData");
  if (!data) return {
    locales: ['en-US', 'zh-CN'],
    wordPairs: []
  };
  try {
    const parsedData = JSON.parse(data);
    const parsedData2 = WordDataSchema.parse(parsedData);
    return parsedData2;
  } catch (error) {
    console.error(error);
    return {
      locales: ['en-US', 'zh-CN'],
      wordPairs: []
    };
  }
}

export default function MemorizePage() {
  const [page, setPage] = useState<"start" | "main" | "edit">("main");
  const [wordData, setWordData] = useState<WordData>(getLocalWordData());
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
