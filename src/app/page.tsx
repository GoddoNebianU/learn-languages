import Link from "next/link";

function MyLink(
  { href, label }: { href: string, label: string }
) {
  return (
    <Link className="hover:bg-gray-400 border-2 border-black m-1 p-2 rounded font-bold" href={href}>{label}</Link>
  )
}

export default function Home() {
  return (
    <div className="bg-gray-50 flex h-screen w-screen items-center justify-center">
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
  );
}
