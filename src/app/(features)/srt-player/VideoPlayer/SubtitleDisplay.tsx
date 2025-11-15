import { inspect } from "@/lib/utils";

export default function SubtitleDisplay({ subtitle }: { subtitle: string }) {
  const words = subtitle.match(/\b[\w']+(?:-[\w']+)*\b/g) || [];
  let i = 0;
  return (
    <div className="w-full subtitle overflow-auto h-16 mt-2 break-words bg-black/50 font-sans text-white text-center text-2xl">
      {words.map((v) => (
        <span
          onClick={inspect(v)}
          key={i++}
          className="hover:bg-gray-700 hover:underline hover:cursor-pointer"
        >
          {v + " "}
        </span>
      ))}
    </div>
  );
}
