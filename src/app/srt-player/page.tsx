'use client';

import { KeyboardEvent, useRef, useState } from "react";
import UploadArea from "./UploadArea";
import VideoPanel from "./VideoPlayer/VideoPanel";
import { Navbar } from "@/components/Navbar";

export default function SrtPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [srtUrl, setSrtUrl] = useState<string | null>(null);
  return (<>
      <Navbar></Navbar>
      <div className="flex w-screen pt-8 items-center justify-center" onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => e.preventDefault()}>
        <div className="w-[80vw] md:w-[45vw] flex items-center flex-col">
          <VideoPanel
            videoUrl={videoUrl}
            srtUrl={srtUrl}
            ref={videoRef} />
          <UploadArea
            setVideoUrl={setVideoUrl}
            setSrtUrl={setSrtUrl} />
        </div>
      </div>
    </>);
}
