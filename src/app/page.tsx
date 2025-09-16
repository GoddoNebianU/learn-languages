function Link(
  {href, label}: {href: string, label: string}
) {
  return (
    <a className="border-2 border-black m-1 p-5 rounded font-bold hover:bg-gray-200" href={href}>{label}</a>
  )
}

export default function Home() {
  return (
    <div className="w-[500px] m-auto mt-[100px] h-[300px]">
      <Link href="/srt-player" label="srt-player"></Link>
      <Link href="/word-board" label="word-board"></Link>
    </div>
  );
}
