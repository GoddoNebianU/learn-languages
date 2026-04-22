"use client";

import { useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  Video,
  FileText,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Pause,
  Play,
  Settings,
  Keyboard,
} from "lucide-react";
import { Button } from "@/design-system/button";
import { Range } from "@/design-system/range";
import { HStack, VStack } from "@/design-system/stack";
import { useSrtPlayerStore } from "../stores/srtPlayerStore";
import { useFileUpload } from "../hooks/useFileUpload";
import { toast } from "sonner";

export function ControlPanel() {
  const t = useTranslations("srt_player");
  const { uploadVideo, uploadSubtitle } = useFileUpload();

  const videoUrl = useSrtPlayerStore((state) => state.video.url);
  const subtitleUrl = useSrtPlayerStore((state) => state.subtitle.url);
  const subtitleData = useSrtPlayerStore((state) => state.subtitle.data);
  const currentIndex = useSrtPlayerStore((state) => state.subtitle.currentIndex);
  const isPlaying = useSrtPlayerStore((state) => state.video.isPlaying);
  const playbackRate = useSrtPlayerStore((state) => state.video.playbackRate);
  const autoPause = useSrtPlayerStore((state) => state.controls.autoPause);
  const showSettings = useSrtPlayerStore((state) => state.controls.showSettings);
  const showShortcuts = useSrtPlayerStore((state) => state.controls.showShortcuts);
  const settings = useSrtPlayerStore((state) => state.subtitle.settings);

  const togglePlayPause = useSrtPlayerStore((state) => state.togglePlayPause);
  const nextSubtitle = useSrtPlayerStore((state) => state.nextSubtitle);
  const previousSubtitle = useSrtPlayerStore((state) => state.previousSubtitle);
  const restartSubtitle = useSrtPlayerStore((state) => state.restartSubtitle);
  const setPlaybackRate = useSrtPlayerStore((state) => state.setPlaybackRate);
  const toggleAutoPause = useSrtPlayerStore((state) => state.toggleAutoPause);
  const setVideoUrl = useSrtPlayerStore((state) => state.setVideoUrl);
  const setSubtitleUrl = useSrtPlayerStore((state) => state.setSubtitleUrl);
  const seek = useSrtPlayerStore((state) => state.seek);
  const toggleSettings = useSrtPlayerStore((state) => state.toggleSettings);
  const toggleShortcuts = useSrtPlayerStore((state) => state.toggleShortcuts);
  const updateSettings = useSrtPlayerStore((state) => state.updateSettings);

  const canPlay = useMemo(
    () => !!videoUrl && !!subtitleUrl && subtitleData.length > 0,
    [videoUrl, subtitleUrl, subtitleData]
  );
  const currentProgress = currentIndex ?? 0;
  const totalProgress = Math.max(0, subtitleData.length - 1);

  const handleVideoUpload = useCallback(() => {
    uploadVideo(setVideoUrl, (error) => {
      toast.error(t("videoUploadFailed") + ": " + error.message);
    });
  }, [uploadVideo, setVideoUrl, t]);

  const handleSubtitleUpload = useCallback(() => {
    uploadSubtitle(
      (url) => {
        setSubtitleUrl(url);
      },
      (error) => {
        toast.error(t("subtitleUploadFailed") + ": " + error.message);
      }
    );
  }, [uploadSubtitle, setSubtitleUrl, t]);

  const handleSeek = useCallback(
    (index: number) => {
      if (subtitleData[index]) {
        seek(subtitleData[index].start);
      }
    },
    [subtitleData, seek]
  );

  const handlePlaybackRateChange = useCallback(() => {
    const rates = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
    const currentIndexRate = rates.indexOf(playbackRate);
    const nextIndexRate = (currentIndexRate + 1) % rates.length;
    setPlaybackRate(rates[nextIndexRate]);
  }, [playbackRate, setPlaybackRate]);

  return (
    <div className="rounded-b-xl border-t bg-gray-50 p-3">
      <VStack gap={3}>
        <HStack gap={3}>
          <div
            className={`flex-1 rounded-lg border-2 p-2 transition-all ${
              videoUrl ? "border-gray-800 bg-gray-100" : "border-gray-300 bg-white"
            }`}
          >
            <HStack gap={2} justify="between">
              <HStack gap={2}>
                <Video className="h-5 w-5 text-gray-600" />
                <VStack gap={0}>
                  <h3 className="text-sm font-semibold text-gray-800">{t("videoFile")}</h3>
                  <p className="text-xs text-gray-600">
                    {videoUrl ? t("uploaded") : t("notUploaded")}
                  </p>
                </VStack>
              </HStack>
              <Button
                variant="light"
                onClick={videoUrl ? undefined : handleVideoUpload}
                disabled={!!videoUrl}
                size="sm"
              >
                {videoUrl ? t("uploaded") : t("upload")}
              </Button>
            </HStack>
          </div>

          <div
            className={`flex-1 rounded-lg border-2 p-2 transition-all ${
              subtitleUrl ? "border-gray-800 bg-gray-100" : "border-gray-300 bg-white"
            }`}
          >
            <HStack gap={2} justify="between">
              <HStack gap={2}>
                <FileText className="h-5 w-5 text-gray-600" />
                <VStack gap={0}>
                  <h3 className="text-sm font-semibold text-gray-800">{t("subtitleFile")}</h3>
                  <p className="text-xs text-gray-600">
                    {subtitleUrl ? t("uploaded") : t("notUploaded")}
                  </p>
                </VStack>
              </HStack>
              <Button
                variant="light"
                onClick={subtitleUrl ? undefined : handleSubtitleUpload}
                disabled={!!subtitleUrl}
                size="sm"
              >
                {subtitleUrl ? t("uploaded") : t("upload")}
              </Button>
            </HStack>
          </div>
        </HStack>

        <VStack gap={4} className={!canPlay ? "pointer-events-none opacity-50" : ""}>
          <HStack gap={2} justify="center" wrap>
            <Button
              onClick={togglePlayPause}
              disabled={!canPlay}
              leftIcon={isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            >
              {isPlaying ? t("pause") : t("play")}
            </Button>

            <Button
              onClick={previousSubtitle}
              disabled={!canPlay}
              leftIcon={<ChevronLeft className="h-4 w-4" />}
            >
              {t("previous")}
            </Button>

            <Button
              onClick={nextSubtitle}
              disabled={!canPlay}
              rightIcon={<ChevronRight className="h-4 w-4" />}
            >
              {t("next")}
            </Button>

            <Button
              onClick={restartSubtitle}
              disabled={!canPlay}
              leftIcon={<RotateCcw className="h-4 w-4" />}
            >
              {t("restart")}
            </Button>

            <Button onClick={handlePlaybackRateChange} disabled={!canPlay}>
              {playbackRate}x
            </Button>

            <Button
              onClick={toggleAutoPause}
              disabled={!canPlay}
              leftIcon={<Pause className="h-4 w-4" />}
              variant={autoPause ? "primary" : "light"}
            >
              {t("autoPause", { enabled: autoPause ? t("on") : t("off") })}
            </Button>

            <Button
              variant="light"
              onClick={toggleSettings}
              leftIcon={<Settings className="h-4 w-4" />}
            >
              {t("settings")}
            </Button>

            <Button
              variant="light"
              onClick={toggleShortcuts}
              leftIcon={<Keyboard className="h-4 w-4" />}
            >
              {t("shortcuts")}
            </Button>
          </HStack>

          <VStack gap={2}>
            <Range
              value={currentProgress}
              min={0}
              max={totalProgress}
              onChange={handleSeek}
              disabled={!canPlay}
            />

            <HStack gap={4} justify="between" className="px-2 text-sm text-gray-600">
              <span>
                {currentIndex !== null ? `${currentIndex + 1}/${subtitleData.length}` : "0/0"}
              </span>

              <HStack gap={4}>
                <span className="rounded bg-gray-200 px-2 py-1 text-xs">{playbackRate}x</span>

                <span
                  className={`rounded px-2 py-1 text-xs ${
                    autoPause ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {t("autoPauseStatus", { enabled: autoPause ? t("on") : t("off") })}
                </span>
              </HStack>
            </HStack>
          </VStack>
        </VStack>

        {showSettings && (
          <div className="rounded-lg border border-gray-200 bg-white p-3">
            <h3 className="mb-3 font-semibold text-gray-800">{t("subtitleSettings")}</h3>
            <VStack gap={3}>
              <HStack gap={2} className="w-full">
                <span className="w-20 text-sm text-gray-600">{t("fontSize")}</span>
                <Range
                  value={settings.fontSize}
                  min={12}
                  max={48}
                  onChange={(value) => updateSettings({ fontSize: value })}
                />
                <span className="w-12 text-sm text-gray-600">{settings.fontSize}px</span>
              </HStack>

              <HStack gap={2} className="w-full">
                <span className="w-20 text-sm text-gray-600">{t("textColor")}</span>
                <input
                  type="color"
                  value={settings.textColor}
                  onChange={(e) => updateSettings({ textColor: e.target.value })}
                  className="h-8 w-8 cursor-pointer rounded"
                />
              </HStack>

              <HStack gap={2} className="w-full">
                <span className="w-20 text-sm text-gray-600">{t("backgroundColor")}</span>
                <input
                  type="color"
                  value={settings.backgroundColor.replace(/rgba?\([^)]+\)/, "#000000")}
                  onChange={(e) => updateSettings({ backgroundColor: e.target.value })}
                  className="h-8 w-8 cursor-pointer rounded"
                />
              </HStack>

              <HStack gap={2} className="w-full">
                <span className="w-20 text-sm text-gray-600">{t("position")}</span>
                <HStack gap={2}>
                  {(["top", "center", "bottom"] as const).map((pos) => (
                    <Button
                      key={pos}
                      size="sm"
                      variant={settings.position === pos ? "primary" : "light"}
                      onClick={() => updateSettings({ position: pos })}
                    >
                      {t(pos)}
                    </Button>
                  ))}
                </HStack>
              </HStack>

              <HStack gap={2} className="w-full">
                <span className="w-20 text-sm text-gray-600">{t("opacity")}</span>
                <Range
                  value={settings.opacity}
                  min={0.1}
                  max={1}
                  step={0.1}
                  onChange={(value) => updateSettings({ opacity: value })}
                />
                <span className="w-12 text-sm text-gray-600">
                  {Math.round(settings.opacity * 100)}%
                </span>
              </HStack>
            </VStack>
          </div>
        )}

        {showShortcuts && (
          <div className="rounded-lg border border-gray-200 bg-white p-3">
            <h3 className="mb-3 font-semibold text-gray-800">{t("keyboardShortcuts")}</h3>
            <VStack gap={2}>
              {[
                { key: "Space", desc: t("playPause") },
                { key: "N", desc: t("next") },
                { key: "P", desc: t("previous") },
                { key: "R", desc: t("restart") },
                { key: "A", desc: t("autoPauseToggle") },
              ].map((shortcut) => (
                <HStack key={shortcut.key} gap={2} justify="between" className="w-full">
                  <kbd className="rounded bg-gray-100 px-2 py-1 font-mono text-sm">
                    {shortcut.key}
                  </kbd>
                  <span className="text-sm text-gray-600">{shortcut.desc}</span>
                </HStack>
              ))}
            </VStack>
          </div>
        )}
      </VStack>
    </div>
  );
}
