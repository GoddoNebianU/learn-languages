"use client";

import { useRef, useEffect, forwardRef } from 'react';
import { useSrtPlayerStore } from '../stores/srtPlayerStore';
import { setVideoRef } from '../stores/srtPlayerStore';

export const VideoPlayerPanel = forwardRef<HTMLVideoElement>((_, ref) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const videoRef = (ref as React.RefObject<HTMLVideoElement>) || localVideoRef;

  const videoUrl = useSrtPlayerStore((state) => state.video.url);
  const subtitleUrl = useSrtPlayerStore((state) => state.subtitle.url);
  const subtitleData = useSrtPlayerStore((state) => state.subtitle.data);
  const currentText = useSrtPlayerStore((state) => state.subtitle.currentText);
  const settings = useSrtPlayerStore((state) => state.subtitle.settings);

  useEffect(() => {
    setVideoRef(videoRef);
  }, [videoRef]);

  return (
    <div className="aspect-video bg-black relative rounded-md overflow-hidden">
      {(!videoUrl || !subtitleUrl || subtitleData.length === 0) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-10">
          <div className="text-center text-white">
            <p className="text-lg mb-2">
              {!videoUrl && !subtitleUrl
                ? '请上传视频和字幕文件'
                : !videoUrl
                  ? '请上传视频文件'
                  : !subtitleUrl
                    ? '请上传字幕文件'
                    : '正在处理字幕...'}
            </p>
            {(!videoUrl || !subtitleUrl) && (
              <p className="text-sm text-gray-300">需要同时上传视频和字幕文件才能播放</p>
            )}
          </div>
        </div>
      )}

      {videoUrl && (
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full"
          playsInline
        />
      )}

      {subtitleUrl && subtitleData.length > 0 && currentText && (
        <div
          className="absolute px-4 py-2 text-center w-full"
          style={{
            bottom: settings.position === 'top' ? 'auto' : settings.position === 'center' ? '50%' : '0',
            top: settings.position === 'top' ? '0' : 'auto',
            transform: settings.position === 'center' ? 'translateY(-50%)' : 'none',
            backgroundColor: settings.backgroundColor,
            color: settings.textColor,
            fontSize: `${settings.fontSize}px`,
            fontFamily: settings.fontFamily,
            opacity: settings.opacity,
          }}
        >
          {currentText}
        </div>
      )}
    </div>
  );
});

VideoPlayerPanel.displayName = 'VideoPlayerPanel';
