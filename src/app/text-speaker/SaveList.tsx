'use client';

import Button from "@/components/Button";
import { getTextSpeakerData, setTextSpeakerData } from "@/utils";
import { useState } from "react";
import z from "zod";
import { TextSpeakerItemSchema } from "@/interfaces";

interface TextCardProps {
    item: z.infer<typeof TextSpeakerItemSchema>;
    handleUse: (item: z.infer<typeof TextSpeakerItemSchema>) => void;
    handleDel: (item: z.infer<typeof TextSpeakerItemSchema>) => void;
}
function TextCard({
    item,
    handleUse,
    handleDel
}: TextCardProps) {
    const onUseClick = () => {
        handleUse(item);
    }
    const onDelClick = () => {
        handleDel(item);
    }
    return (
        <div className="p-2 border-b-1 border-gray-200 m-2 grid grid-cols-8">
            <div className="col-span-6">
                <div className="text-3xl">{item.text.length > 80 ? item.text.slice(0, 80) + '...' : item.text}</div>
                <div className="text-xl text-gray-600">{item.ipa ? (item.ipa.length > 160 ? item.ipa.slice(0, 160) + '...' : item.ipa) : ''}</div>
            </div>
            <Button label="use" className="h-8 col-span-1" onClick={onUseClick}></Button>
            <Button label="del" className="h-8 col-span-1" onClick={onDelClick}></Button>
        </div>
    );
}

interface SaveListProps {
    show?: boolean;
    handleUse: (item: z.infer<typeof TextSpeakerItemSchema>) => void;
}
export default function SaveList({
    show = false,
    handleUse
}: SaveListProps) {
    const [data, setData] = useState(getTextSpeakerData());
    const handleDel = (item: z.infer<typeof TextSpeakerItemSchema>) => {
        const current_data = getTextSpeakerData();
        current_data.splice(
            current_data.findIndex(v => v.text === item.text)
        );
        setTextSpeakerData(current_data);
    }
    const refresh = () => {
        setData(getTextSpeakerData());
    }
    const handleDeleteAll = () => {
        const yesorno = prompt('确定删光吗？(Y/N)')?.trim();
        if (yesorno && (yesorno === 'Y' || yesorno === 'y')) {
            setTextSpeakerData([]);
            refresh();
        }
    }
    if (show) return (
        <div className="my-4 p-2 mx-4 md:mx-32 border-1 border-gray-200 rounded-2xl">
            <Button label="刷新" className="m-1" onClick={refresh}></Button>
            <Button label="删光" className="m-1" onClick={handleDeleteAll}></Button>
            <ul>
                {data.map(v =>
                    <TextCard item={v} key={crypto.randomUUID()} handleUse={handleUse} handleDel={handleDel}></TextCard>
                )}
            </ul>
        </div>
    ); else return (<></>);
}