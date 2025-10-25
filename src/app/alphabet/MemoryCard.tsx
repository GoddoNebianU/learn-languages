import Button from "@/components/Button";
import IconClick from "@/components/IconClick";
import IMAGES from "@/config/images";
import { Letter, SupportedAlphabets } from "@/interfaces";
import { Dispatch, KeyboardEvent, SetStateAction, useEffect, useRef, useState } from "react";

export default function MemoryCard(
    {
        alphabet,
        language,
        setChosenAlphabet
    }: {
        alphabet: Letter[],
        language: string,
        setChosenAlphabet: Dispatch<SetStateAction<SupportedAlphabets | null>>
    }
) {
    const [index, setIndex] = useState(Math.floor(Math.random() * alphabet.length));
    const [more, setMore] = useState(false);
    const [ipaDisplay, setIPADisplay] = useState(true);
    const [letterDisplay, setLetterDisplay] = useState(true);

    useEffect(() => {
        const handleKeydown = (e: globalThis.KeyboardEvent) => {
            if (e.key === ' ') refresh();
        }
        document.addEventListener('keydown', handleKeydown);
        return () => document.removeEventListener('keydown', handleKeydown);
    });

    const letter = alphabet[index];
    const refresh = () => {
        setIndex(Math.floor(Math.random() * alphabet.length));
    }
    return (
        <div className="w-full flex justify-center items-center" onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => e.preventDefault()}>
            {/* <div className="m-4 p-4 w-full md:w-[60dvw] flex-col rounded-2xl shadow border-gray-200 border flex justify-center items-center">
                <div className="w-full flex justify-end items-center">
                    <IconClick size={32} alt="close" src={IMAGES.close} onClick={() => setChosenAlphabet(null)}></IconClick>
                </div>
                <div className="flex flex-col gap-12 justify-center items-center">
                    <span className="text-7xl md:text-9xl">{letterDisplay ? letter.letter : ''}</span>
                    <span className="text-5xl md:text-7xl text-gray-400">{ipaDisplay ? letter.letter_sound_ipa : ''}</span>
                </div>
                <div className="flex flex-row mt-32 items-center justify-center gap-2">
                    <IconClick size={48} alt="refresh" src={IMAGES.refresh} onClick={refresh}></IconClick>
                    <IconClick size={48} alt="more" src={IMAGES.more_horiz} onClick={() => setMore(!more)}></IconClick>
                    {
                        more ? (<>
                            <Button className="w-20" label={letterDisplay ? '隐藏字母' : '显示字母'} onClick={() => { setLetterDisplay(!letterDisplay) }}></Button>
                            <Button className="w-20" label={ipaDisplay ? '隐藏IPA' : '显示IPA'} onClick={() => { setIPADisplay(!ipaDisplay) }}></Button>
                        </>) : (<></>)
                    }
                </div>
            </div> */}
        </div>
    );
}