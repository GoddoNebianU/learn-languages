'use client';

export default function WordBoard(
    { words }: {
        words: [
            {
                word: string,
                x: number,
                y: number
            }
        ]
    }
) {
    const inspect = (word: string) => {
        const goto = (url: string) => {
            window.open(url, '_blank');
        }
        return () => {
            word = word.toLowerCase();
            goto(`https://www.youdao.com/result?word=${word}&lang=en`);
        }
    }
    return (
        <div className="relative rounded bg-white w-[1000px] h-[600px]">
            {words.map(
                (v: {
                    word: string,
                    x: number,
                    y: number
                }, i: number) => {
                    return (<span
                        style={{
                            left: `${Math.floor(v.x * (1000 - 18 * v.word.length))}px`,
                            top: `${Math.floor(v.y * (600 - 30))}px`,
                        }}
                        className={`select-none cursor-pointer absolute font-mono text-[30px] border-amber-100 border-1`}
                        key={i}
                        onClick={inspect(v.word)}>{v.word}</span>)
                })}
        </div>
    )
}