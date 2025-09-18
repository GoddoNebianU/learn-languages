function Link(
  {href, label}: {href: string, label: string}
) {
  return (
    <a className="border-2 border-black m-1 p-5 rounded font-bold hover:bg-gray-200" href={href}>{label}</a>
  )
}

export default function Home() {
  return (
    <div className="w-80 m-auto mt-[100px]">
      <h1 className="mb-8 text-4xl font-bold">学外语</h1>
      <Link href="/srt-player" label="srt-player"></Link>
      <Link href="/word-board" label="word-board"></Link>
      <p className="mt-8">srt-player: 一个基于srt字幕文件的逐句视频播放器，需要上传视频文件与字幕文件使用。</p>
      <p>word-board: 一个板式单词记忆工具。</p>
    </div>
  );
}
