import Link from "next/link";
import Image from "next/image";

function MyLink(
  { href, label }: { href: string, label: string }
) {
  return (
    <Link className="font-bold" href={href}>{label}</Link>
  )
}

function Navbar() {
  return (
    <div className="flex justify-between items-center w-screen h-[96px] bg-white px-8">
      <Link href={'/'} className="text-xl flex">
        <Image
          src={'/favicon.ico'}
          alt="logo"
          width="32"
          height="32"
          className="rounded-4xl">
        </Image>
        <span>学语言</span>
      </Link>
      <div className="flex gap-8 text-xl">
        <MyLink href="/about" label="关于"></MyLink>
        <MyLink href="https://github.com/GoddoNebianU/learn-languages" label="源码"></MyLink>
      </div>
      <div></div>
    </div>
  )
}

export default function Home() {
  return (<>
    <Navbar></Navbar>
    <div className="bg-gray-50 flex h-screen w-full items-center justify-center">
      <div className="bg-white m-4 p-4 rounded-2xl shadow-2xl border-gray-400 border-2 flex-col flex items-center">
        <span className="text-4xl font-bold">Learn Languages</span>
        <div className="LinkList flex flex-wrap sm:flex-row">
          <MyLink href="/srt-player" label="srt-player"></MyLink>
          <MyLink href="/word-board" label="word-board"></MyLink>
          <MyLink href="/ipa-reader" label="ipa-reader"></MyLink>
          <MyLink href={'/changelog.txt'} label="changelog"></MyLink>
        </div>
      </div>
    </div>
  </>);
}
