"use client";

import React, { forwardRef } from "react";
import { VideoElementProps } from "../../types/player";

const VideoElement = forwardRef<HTMLVideoElement, VideoElementProps>(
  ({ src, onTimeUpdate, onLoadedMetadata, onPlay, onPause, onEnded, className }, ref) => {
    const handleTimeUpdate = React.useCallback((event: React.SyntheticEvent<HTMLVideoElement>) => {
      const video = event.currentTarget;
      onTimeUpdate?.(video.currentTime);
    }, [onTimeUpdate]);

    const handleLoadedMetadata = React.useCallback((event: React.SyntheticEvent<HTMLVideoElement>) => {
      const video = event.currentTarget;
      onLoadedMetadata?.(video.duration);
    }, [onLoadedMetadata]);

    const handlePlay = React.useCallback((event: React.SyntheticEvent<HTMLVideoElement>) => {
      onPlay?.();
    }, [onPlay]);

    const handlePause = React.useCallback((event: React.SyntheticEvent<HTMLVideoElement>) => {
      onPause?.();
    }, [onPause]);

    const handleEnded = React.useCallback((event: React.SyntheticEvent<HTMLVideoElement>) => {
      onEnded?.();
    }, [onEnded]);

    return (
      <video
        ref={ref}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        className={`bg-gray-200 w-full ${className || ""}`}
        playsInline
        controls={false}
      />
    );
  }
);

VideoElement.displayName = "VideoElement";

export default VideoElement;