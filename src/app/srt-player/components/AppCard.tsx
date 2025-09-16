'use client'

import { useRef, useState } from "react";
import UploadArea from "./UploadArea";
import VideoPanel from "./VideoPlayer/VideoPanel";

export default function AppCard() {
    const videoRef = useRef<HTMLVideoElement>(null);

    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [srtUrl, setSrtUrl] = useState<string | null>(null);

    return (
        <div className="min-w-[410px] max-h-[1000px] max-w-[1400px] flex items-center flex-col bg-gray-200 rounded shadow-2xl w-8/12 py-12">
            <p className="text-4xl font-extrabold">SRT Video Player</p>
            <VideoPanel
                videoUrl={videoUrl}
                srtUrl={srtUrl}
                ref={videoRef} />
            <UploadArea
                setVideoUrl={setVideoUrl}
                setSrtUrl={setSrtUrl} />
        </div>
    );
}
