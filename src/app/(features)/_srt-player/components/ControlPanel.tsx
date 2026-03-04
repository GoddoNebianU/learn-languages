"use client";

import { useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Video, FileText, ChevronLeft, ChevronRight, RotateCcw, Pause, Play } from 'lucide-react';
import { Button, LightButton } from '@/design-system/base/button';
import { Range } from '@/design-system/base/range';
import { HStack, VStack } from '@/design-system/layout/stack';
import { useSrtPlayerStore } from '../store';
import { useFileUpload } from '../hooks/useFileUpload';
import { toast } from 'sonner';

export function ControlPanel() {
  const t = useTranslations('srt_player');
  const { uploadVideo, uploadSubtitle } = useFileUpload();

  // Store state
  const videoUrl = useSrtPlayerStore((state) => state.video.url);
  const subtitleUrl = useSrtPlayerStore((state) => state.subtitle.url);
  const subtitleData = useSrtPlayerStore((state) => state.subtitle.data);
  const currentIndex = useSrtPlayerStore((state) => state.subtitle.currentIndex);
  const isPlaying = useSrtPlayerStore((state) => state.video.isPlaying);
  const playbackRate = useSrtPlayerStore((state) => state.video.playbackRate);
  const autoPause = useSrtPlayerStore((state) => state.controls.autoPause);

  // Store actions
  const togglePlayPause = useSrtPlayerStore((state) => state.togglePlayPause);
  const nextSubtitle = useSrtPlayerStore((state) => state.nextSubtitle);
  const previousSubtitle = useSrtPlayerStore((state) => state.previousSubtitle);
  const restartSubtitle = useSrtPlayerStore((state) => state.restartSubtitle);
  const setPlaybackRate = useSrtPlayerStore((state) => state.setPlaybackRate);
  const toggleAutoPause = useSrtPlayerStore((state) => state.toggleAutoPause);
  const setVideoUrl = useSrtPlayerStore((state) => state.setVideoUrl);
  const setSubtitleUrl = useSrtPlayerStore((state) => state.setSubtitleUrl);
  const seek = useSrtPlayerStore((state) => state.seek);

  // Computed values
  const canPlay = useMemo(() => !!videoUrl && !!subtitleUrl && subtitleData.length > 0, [videoUrl, subtitleUrl, subtitleData]);
  const currentProgress = currentIndex ?? 0;
  const totalProgress = Math.max(0, subtitleData.length - 1);

  // Handle video upload
  const handleVideoUpload = useCallback(() => {
    uploadVideo(setVideoUrl, (error) => {
      toast.error(t('videoUploadFailed') + ': ' + error.message);
    });
  }, [uploadVideo, setVideoUrl, t]);

  // Handle subtitle upload
  const handleSubtitleUpload = useCallback(() => {
    uploadSubtitle(setSubtitleUrl, (error) => {
      toast.error(t('subtitleUploadFailed') + ': ' + error.message);
    });
  }, [uploadSubtitle, setSubtitleUrl, t]);

  // Handle seek
  const handleSeek = useCallback((index: number) => {
    if (subtitleData[index]) {
      seek(subtitleData[index].start);
    }
  }, [subtitleData, seek]);

  // Handle playback rate change
  const handlePlaybackRateChange = useCallback(() => {
    const rates = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    setPlaybackRate(rates[nextIndex]);
  }, [playbackRate, setPlaybackRate]);

  return (
    <div className="p-3 bg-gray-50 border-t rounded-b-xl">
      <VStack gap={3}>
        {/* Upload Status Cards */}
        <HStack gap={3}>
          {/* Video Upload Card */}
          <div
            className={`flex-1 p-2 rounded-lg border-2 transition-all ${
              videoUrl ? 'border-gray-800 bg-gray-100' : 'border-gray-300 bg-white'
            }`}
          >
            <HStack gap={2} justify="between">
              <HStack gap={2}>
                <Video className="w-5 h-5 text-gray-600" />
                <VStack gap={0}>
                  <h3 className="font-semibold text-gray-800 text-sm">{t('videoFile')}</h3>
                  <p className="text-xs text-gray-600">{videoUrl ? t('uploaded') : t('notUploaded')}</p>
                </VStack>
              </HStack>
              <LightButton
                onClick={videoUrl ? undefined : handleVideoUpload}
                disabled={!!videoUrl}
                size="sm"
              >
                {videoUrl ? t('uploaded') : t('upload')}
              </LightButton>
            </HStack>
          </div>

          {/* Subtitle Upload Card */}
          <div
            className={`flex-1 p-2 rounded-lg border-2 transition-all ${
              subtitleUrl ? 'border-gray-800 bg-gray-100' : 'border-gray-300 bg-white'
            }`}
          >
            <HStack gap={2} justify="between">
              <HStack gap={2}>
                <FileText className="w-5 h-5 text-gray-600" />
                <VStack gap={0}>
                  <h3 className="font-semibold text-gray-800 text-sm">{t('subtitleFile')}</h3>
                  <p className="text-xs text-gray-600">{subtitleUrl ? t('uploaded') : t('notUploaded')}</p>
                </VStack>
              </HStack>
              <LightButton
                onClick={subtitleUrl ? undefined : handleSubtitleUpload}
                disabled={!!subtitleUrl}
                size="sm"
              >
                {subtitleUrl ? t('uploaded') : t('upload')}
              </LightButton>
            </HStack>
          </div>
        </HStack>

        {/* Controls Area */}
        <VStack
          gap={4}
          className={!canPlay ? 'opacity-50 pointer-events-none' : ''}
        >
          {/* Playback Controls */}
          <HStack gap={2} justify="center" wrap>
            <Button
              onClick={togglePlayPause}
              disabled={!canPlay}
              leftIcon={isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            >
              {isPlaying ? t('pause') : t('play')}
            </Button>

            <Button
              onClick={previousSubtitle}
              disabled={!canPlay}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              {t('previous')}
            </Button>

            <Button
              onClick={nextSubtitle}
              disabled={!canPlay}
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              {t('next')}
            </Button>

            <Button
              onClick={restartSubtitle}
              disabled={!canPlay}
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              {t('restart')}
            </Button>

            <Button
              onClick={handlePlaybackRateChange}
              disabled={!canPlay}
            >
              {playbackRate}x
            </Button>

            <Button
              onClick={toggleAutoPause}
              disabled={!canPlay}
              leftIcon={<Pause className="w-4 h-4" />}
              variant={autoPause ? 'primary' : 'secondary'}
            >
              {t('autoPause', { enabled: autoPause ? t('on') : t('off') })}
            </Button>
          </HStack>

          {/* Seek Bar */}
          <VStack gap={2}>
            <Range
              value={currentProgress}
              min={0}
              max={totalProgress}
              onChange={handleSeek}
              disabled={!canPlay}
            />

            {/* Progress Stats */}
            <HStack gap={4} justify="between" className="text-sm text-gray-600 px-2">
              <span>
                {currentIndex !== null ? `${currentIndex + 1}/${subtitleData.length}` : '0/0'}
              </span>

              <HStack gap={4}>
                {/* Playback Rate Badge */}
                <span className="bg-gray-200 px-2 py-1 rounded text-xs">
                  {playbackRate}x
                </span>

                {/* Auto Pause Badge */}
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    autoPause ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {t('autoPauseStatus', { enabled: autoPause ? t('on') : t('off') })}
                </span>
              </HStack>
            </HStack>
          </VStack>
        </VStack>
      </VStack>
    </div>
  );
}
