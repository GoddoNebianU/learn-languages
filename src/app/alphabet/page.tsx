'use client';

import Button from "@/components/Button";
import { Letter, SupportedAlphabets } from "@/interfaces";
import { useEffect, useState } from "react";
import MemoryCard from "./MemoryCard";
import { Navbar } from "@/components/Navbar";

export default function Home() {
    const [chosenAlphabet, setChosenAlphabet] = useState<SupportedAlphabets | null>(null);
    const [alphabetData, setAlphabetData] = useState<Record<SupportedAlphabets, Letter[] | null>>({
        japanese: null,
        english: null,
        esperanto: null,
        uyghur: null
    });
    const [loadingState, setLoadingState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');


    useEffect(() => {
        if (chosenAlphabet && !alphabetData[chosenAlphabet]) {
            setLoadingState('loading');

            fetch('/alphabets/' + chosenAlphabet + '.json')
                .then(res => {
                    if (!res.ok) throw new Error('Network response was not ok');
                    return res.json();
                }).then((obj) => {
                    setAlphabetData(prev => ({ ...prev, [chosenAlphabet]: obj as Letter[] }));
                    setLoadingState('success');
                }).catch(() => {
                    setLoadingState('error');
                });
        }
    }, [chosenAlphabet, alphabetData]);

    useEffect(() => {
        if (loadingState === 'error') {
            const timer = setTimeout(() => {
                setLoadingState('idle');
                setChosenAlphabet(null);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [loadingState]);

    if (!chosenAlphabet) return (<>
        <Navbar></Navbar>
        <div className="border border-gray-200 m-4 mt-4 flex flex-col justify-center items-center p-4 rounded-2xl gap-2">
            <span className="text-2xl md:text-3xl">请选择您想学习的字符</span>
            <div className="flex gap-1 flex-wrap">
                <Button label="日语假名" onClick={() => setChosenAlphabet('japanese')}></Button>
                <Button label="英文字母" onClick={() => setChosenAlphabet('english')}></Button>
                <Button label="维吾尔字母" onClick={() => setChosenAlphabet('uyghur')}></Button>
                <Button label="世界语字母" onClick={() => setChosenAlphabet('esperanto')}></Button>
            </div>
        </div>
    </>
    );
    if (loadingState === 'loading') {
        return '加载中...';
    }
    if (loadingState === 'error') {
        return '加载失败，请重试';
    }
    if (loadingState === 'success' && alphabetData[chosenAlphabet]) {
        return (<>
            <Navbar></Navbar>
            <MemoryCard
                language={chosenAlphabet}
                alphabet={alphabetData[chosenAlphabet]}
                setChosenAlphabet={setChosenAlphabet}>
            </MemoryCard>
        </>);
    }
    return null;
}