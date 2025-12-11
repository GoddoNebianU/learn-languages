import { useState, useRef, forwardRef, useEffect, useCallback } from "react";
import SubtitleDisplay from "./SubtitleDisplay";
import LightButton from "@/components/ui/buttons/LightButton";
import { getIndex, parseSrt, getNearistIndex } from "../subtitle";
import { useTranslations } from "next-intl";

type VideoPanelProps = {
  videoUrl: string | null;
  srtUrl: string | null;
};

const VideoPanel = forwardRef<HTMLVideoElement, VideoPanelProps>(
  ({ videoUrl, srtUrl }, videoRef) => {
    const t = useTranslations("srt_player");
    videoRef = videoRef as React.RefObject<HTMLVideoElement>;
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [srtLength, setSrtLength] = useState<number>(0);
    const [progress, setProgress] = useState<number>(-1);
    const [autoPause, setAutoPause] = useState<boolean>(true);
    const [spanText, setSpanText] = useState<string>("");
    const [subtitle, setSubtitle] = useState<string>("");
    const parsedSrtRef = useRef<
      { start: number; end: number; text: string; }[] | null
    >(null);
    const rafldRef = useRef<number>(0);
    const ready = useRef({
      vid: false,
      sub: false,
      all: function () {
        return this.vid && this.sub;
      },
    });

    const togglePlayPause = useCallback(() => {
      if (!videoUrl) return;

      const video = videoRef.current;
      if (!video) return;
      if (video.paused || video.currentTime === 0) {
        video.play();
      } else {
        video.pause();
      }
      setIsPlaying(!video.paused);
    }, [videoRef, videoUrl]);

    useEffect(() => {
      const handleKeyDownEvent = (e: globalThis.KeyboardEvent) => {
        if (e.key === "n") {
          next();
        } else if (e.key === "p") {
          previous();
        } else if (e.key === " ") {
          togglePlayPause();
        } else if (e.key === "r") {
          restart();
        } else if (e.key === "a") {
          handleAutoPauseToggle();
        }
      };
      document.addEventListener("keydown", handleKeyDownEvent);
      return () => document.removeEventListener("keydown", handleKeyDownEvent);
    });

    useEffect(() => {
      const cb = () => {
        if (ready.current.all()) {
          if (!parsedSrtRef.current) {
          } else if (isPlaying) {
            // 这里负责显示当前时间的字幕与自动暂停
            const srt = parsedSrtRef.current;
            const ct = videoRef.current?.currentTime as number;
            const index = getIndex(srt, ct);
            if (index !== null) {
              setSubtitle(srt[index].text);
              if (
                autoPause &&
                ct >= srt[index].end - 0.05 &&
                ct < srt[index].end
              ) {
                videoRef.current!.currentTime = srt[index].start;
                togglePlayPause();
              }
            } else {
              setSubtitle("");
            }
          } else {
          }
        }
        rafldRef.current = requestAnimationFrame(cb);
      };
      rafldRef.current = requestAnimationFrame(cb);
      return () => {
        cancelAnimationFrame(rafldRef.current);
      };
    }, [autoPause, isPlaying, togglePlayPause, videoRef]);

    useEffect(() => {
      if (videoUrl && videoRef.current) {
        videoRef.current.src = videoUrl;
        videoRef.current.load();
        setIsPlaying(false);
        ready.current["vid"] = true;
      }
    }, [videoRef, videoUrl]);
    useEffect(() => {
      if (srtUrl) {
        fetch(srtUrl)
          .then((response) => response.text())
          .then((data) => {
            parsedSrtRef.current = parseSrt(data);
            setSrtLength(parsedSrtRef.current.length);
            ready.current["sub"] = true;
          });
      }
    }, [srtUrl]);

    const timeUpdate = () => {
      if (!parsedSrtRef.current || !videoRef.current) return;
      const index = getIndex(
        parsedSrtRef.current,
        videoRef.current.currentTime,
      );
      if (!index) return;
      setSpanText(`${index + 1}/${parsedSrtRef.current.length}`);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (videoRef.current && parsedSrtRef.current) {
        const newProgress = parseInt(e.target.value);
        videoRef.current.currentTime =
          parsedSrtRef.current[newProgress]?.start || 0;
        setProgress(newProgress);
      }
    };

    const handleAutoPauseToggle = () => {
      setAutoPause(!autoPause);
    };

    const next = () => {
      if (!parsedSrtRef.current || !videoRef.current) return;
      const i = getNearistIndex(
        parsedSrtRef.current,
        videoRef.current.currentTime,
      );
      if (i != null && i + 1 < parsedSrtRef.current.length) {
        videoRef.current.currentTime = parsedSrtRef.current[i + 1].start;
        videoRef.current.play();
        setIsPlaying(true);
      }
    };

    const previous = () => {
      if (!parsedSrtRef.current || !videoRef.current) return;
      const i = getNearistIndex(
        parsedSrtRef.current,
        videoRef.current.currentTime,
      );
      if (i != null && i - 1 >= 0) {
        videoRef.current.currentTime = parsedSrtRef.current[i - 1].start;
        videoRef.current.play();
        setIsPlaying(true);
      }
    };

    const restart = () => {
      if (!parsedSrtRef.current || !videoRef.current) return;
      const i = getNearistIndex(
        parsedSrtRef.current,
        videoRef.current.currentTime,
      );
      if (i != null && i >= 0) {
        videoRef.current.currentTime = parsedSrtRef.current[i].start;
        videoRef.current.play();
        setIsPlaying(true);
      }
    };

    return (
      <div className="w-full flex flex-col">
        <video
          className="bg-gray-200"
          ref={videoRef}
          onTimeUpdate={timeUpdate}
        ></video>
        <SubtitleDisplay subtitle={subtitle}></SubtitleDisplay>
        <div className="buttons flex mt-2 gap-2 flex-wrap">
          <LightButton onClick={togglePlayPause}>
            {isPlaying ? t("pause") : t("play")}
          </LightButton>
          <LightButton onClick={previous}>{t("previous")}</LightButton>
          <LightButton onClick={next}>{t("next")}</LightButton>
          <LightButton onClick={restart}>{t("restart")}</LightButton>
          <LightButton onClick={handleAutoPauseToggle}>
            {t("autoPause", { enabled: autoPause ? "Yes" : "No" })}
          </LightButton>
        </div>
        <input
          className="seekbar"
          type="range"
          min={0}
          max={srtLength}
          onChange={handleSeek}
          step={1}
          value={progress}
        ></input>
        <span>{spanText}</span>
      </div>
    );
  },
);

VideoPanel.displayName = "VideoPanel";

export default VideoPanel;
