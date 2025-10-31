import { Navbar } from "@/components/Navbar";
import Link from "next/link";

function TopArea() {
  return (
    <div className="bg-[#35786f] text-white w-full min-h-[75dvh] flex justify-center items-center">
      <div className="mb-16 mx-16 md:mx-0 md:max-w-[60dvw]">
        <h1 className="text-6xl md:text-9xl mb-8">Learn Languages</h1>
        <p className="text-2xl md:text-5xl">
          Here is a very useful website to help you learn almost every language
          in the world, including constructed ones.
        </p>
      </div>
    </div>
  );
}

interface LinkAreaProps {
  href: string;
  name: string;
  description: string;
  color: string;
}
function LinkArea({ href, name, description, color }: LinkAreaProps) {
  return (
    <Link
      href={href}
      style={{ backgroundColor: color }}
      className={`h-32 md:h-64 flex justify-center items-center`}
    >
      <div className="text-white m-8">
        <h1 className="text-4xl">{name}</h1>
        <p className="text-xl">{description}</p>
      </div>
    </Link>
  );
}

function LinkGrid() {
  return (
    <div className="w-full grid grid-cols-1 grid-rows-6 md:grid-cols-3">
      <LinkArea
        href="/translator"
        name="翻译器"
        description="翻译到任何语言，并标注国际音标（IPA）"
        color="#a56068"
      ></LinkArea>
      <LinkArea
        href="/text-speaker"
        name="朗读器"
        description="识别并朗读文本，支持循环朗读、朗读速度调节"
        color="#578aad"
      ></LinkArea>
      {/* <LinkArea
        href="/word-board"
        name="词墙"
        description="将单词固定到一片区域，高效便捷地记忆单词"
        color="#e9b353"></LinkArea> */}
      <LinkArea
        href="/srt-player"
        name="逐句视频播放器"
        description="基于SRT字幕文件，逐句播放视频以模仿母语者的发音"
        color="#3c988d"
      ></LinkArea>
      <LinkArea
        href="/alphabet"
        name="背字母"
        description="从字母表开始新语言的学习"
        color="#dd7486"
      ></LinkArea>
      <LinkArea
        href="/memorize"
        name="背单词"
        description="语言A到语言B，语言B到语言A，支持听写"
        color="#cc9988"
      ></LinkArea>
      <LinkArea
        href="#"
        name="更多功能"
        description="开发中，敬请期待"
        color="#cab48a"
      ></LinkArea>
    </div>
  );
}

function Fortune() {
  return (
    <div className="w-full flex justify-center font-serif items-center flex-col min-h-64 h-[25vdh]">
      <p className="text-3xl">Stay hungry, stay foolish.</p>
      <cite className="text-[#e9b353] text-xl">—— Steve Jobs</cite>
    </div>
  );
}

function Explore() {
  return (
    <div className="bg-[#bbbbbb] w-full flex justify-center items-center flex-col h-52">
      <span className="text-[100px] text-white">探索网站</span>
      <div className="w-0 h-0 border-l-40 border-r-40 border-t-30 border-l-transparent border-r-transparent border-t-white"></div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Navbar></Navbar>
      <TopArea></TopArea>
      <Fortune></Fortune>
      <Explore></Explore>
      <LinkGrid></LinkGrid>
    </>
  );
}
