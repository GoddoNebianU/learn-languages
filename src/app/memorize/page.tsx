"use client";

import Button from "@/components/Button";
import { Select, Option } from "@material-tailwind/react";
import { ChangeEvent, useState } from "react";

interface ACardProps {
  children?: React.ReactNode;
  className?: string;
}

function ACard({ children, className }: ACardProps) {
  return (
    <div
      className={`w-[61vw] h-96 p-2 shadow-2xl bg-[#00BCD4] rounded-xl ${className}`}
    >
      {children}
    </div>
  );
}

interface BCard {
  children?: React.ReactNode;
  className?: string;
}
function BCard({ children, className }: BCard) {
  return (
    <div className={`border border-[#0097A7] rounded-xl p-2 ${className}`}>
      {children}
    </div>
  );
}

interface WordData {
  locale1: string;
  locale2: string;
  data: Record<string, string>;
}

export default function Memorize() {
  const [pageState, setPageState] = useState<
    "choose" | "start" | "main" | "edit"
  >("edit");
  const [wordData, setWordData] = useState<WordData>({
    locale1: "en-US",
    locale2: "zh-CN",
    data: { hello: "你好" },
  });
  if (pageState === "main") {
    return (
      <>
        <div className="w-full h-screen flex justify-center items-center">
          <ACard>
            <h1 className="text-center font-extrabold text-4xl text-white m-2 mb-4">
              Memorize
            </h1>
            <div className="w-full text-white">
              <BCard>
                <p>Lang1: {wordData.locale1}</p>
                <p>Lang2: {wordData.locale2}</p>
                <p>Total Words: {Object.keys(wordData.data).length}</p>
              </BCard>
            </div>
            <div className="w-full flex items-center justify-center">
              <BCard className="flex gap-2 justify-center items-center w-fit">
                <Button>Start</Button>
                <Button>Load</Button>
                <Button>Save</Button>
                <Button onClick={() => setPageState("edit")}>Edit</Button>
              </BCard>
            </div>
          </ACard>
        </div>
      </>
    );
  }
  if (pageState === "choose") {
    return <></>;
  }
  if (pageState === "start") {
    return <></>;
  }
  if (pageState === "edit") {
    const convertIntoWordData = (text: string) => {
      const t1 = text
        .split("\n")
        .map((v) => v.trim())
        .filter((v) => v.includes(","));
      const t2 = t1.map((v) => {
        const [left, right] = v.split(",", 2).map((v) => v.trim());
        if (left && right)
          return {
            [left]: right,
          };
        else return {};
      });
      const new_data = {
        locale1: wordData.locale1,
        locale2: wordData.locale2,
        data: Object.assign({}, ...t2),
      };
      setWordData(new_data);
    };
    const convertFromWordData = () => {
      let result = "";
      for (const k in wordData.data) {
        result += `${k}, ${wordData.data[k]}\n`;
      }
      return result;
    };
    let input = convertFromWordData();
    const handleSave = () => {
      convertIntoWordData(input);
      setPageState("main");
    };
    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
      input = e.target.value;
    };
    return (
      <>
        <div className="w-full h-screen flex flex-col justify-center items-center">
          <ACard className="">
            <textarea
              className="text-white border-gray-200 border rounded-2xl w-full h-50 resize-none outline-0 p-2"
              defaultValue={input}
              onChange={handleChange}
            ></textarea>
            <div className="w-full flex items-center justify-center">
              <BCard className="flex gap-2 justify-center items-center w-fit">
                <Button>choose locale1</Button>
                <Button>choose locale2</Button>
                <Button onClick={() => setPageState("main")}>Cancel</Button>
                <Button onClick={handleSave}>Save</Button>
                <button className="inline-flex items-center justify-center border align-middle select-none font-sans font-medium text-center transition-all duration-300 ease-in disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed data-[shape=pill]:rounded-full data-[width=full]:w-full focus:shadow-none text-sm rounded-md py-2 px-4 shadow-sm hover:shadow-md bg-slate-800 border-slate-800 text-slate-50 hover:bg-slate-700 hover:border-slate-700">
                  Button
                </button>
              </BCard>
            </div>
            <div className="w-48"></div>
          </ACard>
        </div>

        {/* <Select
                            label="选择语言"
                            placeholder="请选择语言"
                            onResize={undefined}
                            onResizeCapture={undefined}
                            onPointerEnterCapture={undefined}
                            onPointerLeaveCapture={undefined}
                        >
                            <Option>Material Tailwind HTML</Option>
                            <Option>Material Tailwind React</Option>
                            <Option>Material Tailwind Vue</Option>
                            <Option>Material Tailwind Angular</Option>
                            <Option>Material Tailwind Svelte</Option>
                        </Select> */}
      </>
    );
  }
}
