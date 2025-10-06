import Link from "next/link";





function TopArea() {
  return (
    <div className="bg-[#35786f] text-white">
      <div className="flex justify-center items-center h-[75vh]">
        <div className="mb-16 mx-64">
          <h1 className="text-6xl md:text-9xl mb-8">Learn Languages</h1>
          <p className="text-2xl md:text-5xl">Here is a very useful website to help you learn almost every language in the world, including artificial languages.</p>
        </div>
      </div>
    </div>
  )
}

interface LinkAreaProps {
  href: string,
  name: string,
  description: string,
  color: string
}
function LinkArea(
  { href, name, description, color }: LinkAreaProps
) {
  return (
    <Link href={href}
      style={{ backgroundColor: color }}
      className={`h-32 md:h-[20vw] flex justify-center items-center`}>
      <div className="text-white m-8">
        <h1 className="text-4xl">{name}</h1>
        <p className="text-xl">{description}</p>
      </div>
    </Link>
  );
}

function LinkGrid() {
  return (
    <div className="grid grid-cols-1 grid-rows-6 md:grid-cols-3">

      <LinkArea
        href="/translator"
        name="翻译器"
        description="翻译到任何语言，并标注国际音标（IPA）"
        color="#a56068"></LinkArea>
      <LinkArea
        href="/word-board"
        name="词墙"
        description="将单词固定到一片区域，高效便捷地记忆单词"
        color="#e9b353"></LinkArea>
      <LinkArea
        href="/srt-player"
        name="逐句视频播放器"
        description="基于SRT字幕文件，逐句播放视频以模仿母语者的发音"
        color="#3c988d"></LinkArea>
      <LinkArea
        href="#"
        name="更多功能"
        description="开发中，敬请期待"
        color="#578aad"></LinkArea>
    </div>
  )
}

export default function Home() {
  return (<>
    <TopArea></TopArea>
    <div className="w-screen h-64 flex justify-center font-serif items-center flex-col">
      <p className="text-3xl">Stay hungry, stay foolish.</p>
      <cite className="text-[#e9b353] text-xl">—— Steve Jobs</cite>
    </div>
    <div className="bg-[#bbbbbb] w-screen h-64 flex justify-center items-center flex-col">
      <span className="text-[100px] text-white">探索网站</span>
      <div className="w-0 h-0 border-l-[40px] border-r-[40px] border-t-[30px] border-l-transparent border-r-transparent border-t-white"></div>
    </div>
    <LinkGrid></LinkGrid>
  </>);
}
