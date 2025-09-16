export default function SubtitleDisplay({ subtitle }: { subtitle: string }) {
    const words = subtitle.match(/\b[\w']+(?:-[\w']+)*\b/g) || [];
    const goto = (url: string) => {
        window.open(url, '_blank');
    }
    const inspect = (word: string) => {
        return () => {
            word = word.toLowerCase();
            goto(`https://www.youdao.com/result?word=${word}&lang=en`);
        }
    }
    let i = 0;
    return (
        <div className="subtitle overflow-y-auto h-16 mt-2 break-words bg-black/50 font-sans text-white text-center text-2xl">
            {
                words.map((v) => (
                    <span
                        onClick={inspect(v)}
                        key={i++}
                        className="hover:bg-gray-700 hover:underline hover:cursor-pointer"
                    >
                        {v + ' '}
                    </span>
                ))
            }
        </div>
    );
}