"use client";

import { LightButton, PageLayout } from "@/components/ui";
import { useVideoStore } from "./stores/videoStore";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { HStack } from "@/design-system/layout/stack";
import { MessageSquareQuote, Video } from "lucide-react";
import { useFileUpload } from "./useFileUpload";
import { useSubtitleStore } from "./stores/substitleStore";
import { getCurrentIndex } from "./subtitleParser";

export default function SRTPlayerPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { setVideoRef, pause, currentSrc, isPlaying, loadVideo, loaded, getCurrentTime, getDuration, play, setOnTimeUpdate } = useVideoStore();
  const {
    uploadVideo,
    uploadSubtitle,
  } = useFileUpload();
  const {
    sub,
    setSub,
    index,
    setIndex
  } = useSubtitleStore();

  useEffect(() => {
    setVideoRef(videoRef);
    setOnTimeUpdate((time) => {
      setIndex(getCurrentIndex(sub, time));
    });
    return () => {
      setVideoRef();
      setOnTimeUpdate(() => { });
    };
  }, [setVideoRef, setOnTimeUpdate, sub, setIndex]);

  return (
    <PageLayout>
      <video ref={videoRef} width="85%" className="mx-auto"></video>

      <div className="shadow rounded h-20 w-[85%] mx-auto flex-wrap flex items-begin justify-center">
        {
          sub[index] && sub[index].text.split(" ").map((s, i) =>
            <Link key={i}
              href={`/dictionary?q=${s}`}
              className="px-1 h-fit hover:bg-gray-200 hover:cursor-pointer">
              {s}
            </Link>
          )}
      </div>

      {/* 上传区域 */}
      <div className="mx-auto mt-4 flex items-center justify-center flex-wrap gap-2 w-[85%]">
        <div className="border-gray-200 border-2 flex items p-2 justify-between items-center rounded gap-8">
          <div className="flex items-center flex-col">
            <Video size={16} />
            <span className="text-sm">视频文件</span>
          </div>
          <LightButton
            onClick={() => uploadVideo((url) => {
              loadVideo(url);
            })}>{loaded ? currentSrc?.split("/").pop() : "视频未上传"}</LightButton>
        </div>
        <div className="border-gray-200 border-2 flex items p-2 justify-between items-center rounded gap-8">
          <div className="flex items-center flex-col">
            <MessageSquareQuote size={16} />
            <span className="text-sm"
            >{sub.length > 0 ? `字幕已上传 (${sub.length} 条)` : "字幕未上传"}</span>
          </div>
          <LightButton
            onClick={() =>
              uploadSubtitle((sub) => {
                setSub(sub);
              })
            }>上传字幕</LightButton>
        </div>
      </div>

      {
        /* 控制面板 */
        sub.length > 0 && loaded &&
        <HStack gap={2} className="mx-auto mt-4 w-[85%]" justify={"center"} wrap>
          {isPlaying() ?
            LightButton({ children: "pause", onClick: () => pause() }) :
            LightButton({ children: "play", onClick: () => play() })}
          <LightButton>previous</LightButton>
          <LightButton>next</LightButton>
          <LightButton>restart</LightButton>
          <LightButton>1x</LightButton>
          <LightButton>ap(on)</LightButton>
        </HStack>
      }

    </PageLayout>
  );
}
