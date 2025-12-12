"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Video, FileText } from "lucide-react";
import { useSrtPlayer } from "./hooks/useSrtPlayer";
import { useSubtitleSync } from "./hooks/useSubtitleSync";
import { useKeyboardShortcuts, createSrtPlayerShortcuts } from "./hooks/useKeyboardShortcuts";
import { useFileUpload } from "./hooks/useFileUpload";
import { loadSubtitle } from "./utils/subtitleParser";
import VideoPlayer from "./components/compounds/VideoPlayer";
import SubtitleArea from "./components/compounds/SubtitleArea";
import ControlBar from "./components/compounds/ControlBar";
import UploadZone from "./components/compounds/UploadZone";
import SeekBar from "./components/atoms/SeekBar";
import DarkButton from "@/components/ui/buttons/DarkButton";

export default function SrtPlayerPage() {
  const t = useTranslations("home");
  const srtT = useTranslations("srt_player");
  const { uploadVideo, uploadSubtitle } = useFileUpload();
  const {
    state,
    actions,
    videoRef,
    videoEventHandlers,
    subtitleActions
  } = useSrtPlayer();

  // 字幕同步
  useSubtitleSync(
    state.subtitle.data,
    state.video.currentTime,
    state.video.isPlaying,
    state.controls.autoPause,
    (subtitle) => {
      if (subtitle) {
        subtitleActions.setCurrentSubtitle(subtitle.text, subtitle.index);
      } else {
        subtitleActions.setCurrentSubtitle("", null);
      }
    },
    (subtitle) => {
      // 自动暂停逻辑
      actions.seek(subtitle.start);
      actions.pause();
    }
  );

  // 键盘快捷键
  const shortcuts = React.useMemo(() =>
    createSrtPlayerShortcuts(
      actions.togglePlayPause,
      actions.nextSubtitle,
      actions.previousSubtitle,
      actions.restartSubtitle,
      actions.toggleAutoPause
    ), [
    actions.togglePlayPause,
    actions.nextSubtitle,
    actions.previousSubtitle,
    actions.restartSubtitle,
    actions.toggleAutoPause
  ]
  );

  useKeyboardShortcuts(shortcuts);

  // 处理字幕文件加载
  React.useEffect(() => {
    if (state.subtitle.url) {
      loadSubtitle(state.subtitle.url)
        .then(subtitleData => {
          subtitleActions.setSubtitleData(subtitleData);
          toast.success(srtT("subtitleLoadSuccess"));
        })
        .catch(error => {
          toast.error(srtT("subtitleLoadFailed") + ": " + error.message);
        });
    }
  }, [srtT, state.subtitle.url, subtitleActions]);

  // 处理进度条变化
  const handleSeek = React.useCallback((index: number) => {
    if (state.subtitle.data[index]) {
      actions.seek(state.subtitle.data[index].start);
    }
  }, [state.subtitle.data, actions]);

  // 处理视频上传
  const handleVideoUpload = React.useCallback(() => {
    uploadVideo(actions.setVideoUrl, (error) => {
      toast.error(srtT("videoUploadFailed") + ": " + error.message);
    });
  }, [uploadVideo, actions.setVideoUrl, srtT]);

  // 处理字幕上传
  const handleSubtitleUpload = React.useCallback(() => {
    uploadSubtitle(actions.setSubtitleUrl, (error) => {
      toast.error(srtT("subtitleUploadFailed") + ": " + error.message);
    });
  }, [uploadSubtitle, actions.setSubtitleUrl, srtT]);

  // 检查是否可以播放
  const canPlay = state.video.url && state.subtitle.url && state.subtitle.data.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* 标题区域 */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              {t("srtPlayer.name")}
            </h1>
            <p className="text-lg text-gray-600">
              {t("srtPlayer.description")}
            </p>
          </div>

          {/* 主要内容区域 */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* 视频播放器区域 */}
            <div className="aspect-video bg-black relative">
              {(!state.video.url || !state.subtitle.url || state.subtitle.data.length === 0) && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-10">
                  <div className="text-center text-white">
                    <p className="text-lg mb-2">
                      {!state.video.url && !state.subtitle.url
                        ? srtT("uploadVideoAndSubtitle")
                        : !state.video.url
                          ? srtT("uploadVideoFile")
                          : !state.subtitle.url
                            ? srtT("uploadSubtitleFile")
                            : srtT("processingSubtitle")
                      }
                    </p>
                    {(!state.video.url || !state.subtitle.url) && (
                      <p className="text-sm text-gray-300">
                        {srtT("needBothFiles")}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {state.video.url && (
                <VideoPlayer
                  ref={videoRef}
                  src={state.video.url}
                  {...videoEventHandlers}
                  className="w-full h-full"
                >
                  {state.subtitle.url && state.subtitle.data.length > 0 && (
                    <SubtitleArea
                      subtitle={state.subtitle.currentText}
                      settings={state.subtitle.settings}
                      className="absolute bottom-0 left-0 right-0 px-4 py-2"
                    />
                  )}
                </VideoPlayer>
              )}
            </div>

            {/* 控制面板 */}
            <div className="p-3 bg-gray-50 border-t">
              {/* 上传区域和状态指示器 */}
              <div className="mb-3">
                <div className="flex gap-3">
                  <div className={`flex-1 p-2 rounded-lg border-2 transition-all ${state.video.url
                    ? 'border-gray-800 bg-gray-100'
                    : 'border-gray-300 bg-white'
                    }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Video className="w-5 h-5 text-gray-600" />
                        <div className="text-left">
                          <h3 className="font-semibold text-gray-800 text-sm">{srtT("videoFile")}</h3>
                          <p className="text-xs text-gray-600">
                            {state.video.url ? srtT("uploaded") : srtT("notUploaded")}
                          </p>
                        </div>
                      </div>
                      <DarkButton
                        onClick={state.video.url ? undefined : handleVideoUpload}
                        disabled={!!state.video.url}
                        className="px-2 py-1 text-xs"
                      >
                        {state.video.url ? srtT("uploaded") : srtT("upload")}
                      </DarkButton>
                    </div>
                  </div>

                  <div className={`flex-1 p-2 rounded-lg border-2 transition-all ${state.subtitle.url
                    ? 'border-gray-800 bg-gray-100'
                    : 'border-gray-300 bg-white'
                    }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-gray-600" />
                        <div className="text-left">
                          <h3 className="font-semibold text-gray-800 text-sm">{srtT("subtitleFile")}</h3>
                          <p className="text-xs text-gray-600">
                            {state.subtitle.url ? srtT("uploaded") : srtT("notUploaded")}
                          </p>
                        </div>
                      </div>
                      <DarkButton
                        onClick={state.subtitle.url ? undefined : handleSubtitleUpload}
                        disabled={!!state.subtitle.url}
                        className="px-2 py-1 text-xs"
                      >
                        {state.subtitle.url ? srtT("uploaded") : srtT("upload")}
                      </DarkButton>
                    </div>
                  </div>
                </div>
              </div>

              {/* 控制按钮和进度条 */}
              <div className={`space-y-4 ${canPlay ? '' : 'opacity-50 pointer-events-none'}`}>
                {/* 控制按钮 */}
                <ControlBar
                  isPlaying={state.video.isPlaying}
                  onPlayPause={actions.togglePlayPause}
                  onPrevious={actions.previousSubtitle}
                  onNext={actions.nextSubtitle}
                  onRestart={actions.restartSubtitle}
                  playbackRate={state.video.playbackRate}
                  onPlaybackRateChange={actions.setPlaybackRate}
                  autoPause={state.controls.autoPause}
                  onAutoPauseToggle={actions.toggleAutoPause}
                  disabled={!canPlay}
                  className="justify-center"
                />

                {/* 进度条 */}
                <div className="space-y-2">
                  <SeekBar
                    value={state.subtitle.currentIndex ?? 0}
                    max={Math.max(0, state.subtitle.data.length - 1)}
                    onChange={handleSeek}
                    disabled={!canPlay}
                    className="h-3"
                  />

                  {/* 字幕进度显示 */}
                  <div className="flex justify-between items-center text-sm text-gray-600 px-2">
                    <span>
                      {state.subtitle.currentIndex !== null ?
                        `${state.subtitle.currentIndex + 1}/${state.subtitle.data.length}` :
                        '0/0'
                      }
                    </span>

                    <div className="flex items-center gap-4">
                      {/* 播放速度显示 */}
                      <span className="bg-gray-200 px-2 py-1 rounded text-xs">
                        {state.video.playbackRate}x
                      </span>

                      {/* 自动暂停状态 */}
                      <span className={`px-2 py-1 rounded text-xs ${state.controls.autoPause
                        ? 'bg-gray-800 text-white'
                        : 'bg-gray-100 text-gray-600'
                        }`}>
                        {srtT("autoPauseStatus", { enabled: state.controls.autoPause ? srtT("on") : srtT("off") })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}