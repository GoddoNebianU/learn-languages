"use client";

import React, { forwardRef } from "react";
import { VideoElementProps } from "../../types/player";
import VideoElement from "../atoms/VideoElement";

interface VideoPlayerComponentProps extends VideoElementProps {
  children?: React.ReactNode;
}

const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerComponentProps>(
  ({
    src,
    onTimeUpdate,
    onLoadedMetadata,
    onPlay,
    onPause,
    onEnded,
    className,
    children
  }, ref) => {
    return (
      <div className={`w-full flex flex-col ${className || ''}`}>
        <VideoElement
          ref={ref}
          src={src}
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onLoadedMetadata}
          onPlay={onPlay}
          onPause={onPause}
          onEnded={onEnded}
        />
        {children}
      </div>
    );
  }
);

VideoPlayer.displayName = "VideoPlayer";

export default VideoPlayer;