"use client";

import { useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Video, FileText, ChevronLeft, ChevronRight, RotateCcw, Pause, Play, Settings, Keyboard } from 'lucide-react';
import { Button } from '@/design-system/base/button';
import { Range } from '@/design-system/base/range';
import { HStack, VStack } from '@/design-system/layout/stack';
import { useSrtPlayerStore } from '../stores/srtPlayerStore';
import { useFileUpload } from '../hooks/useFileUpload';
import { toast } from 'sonner';

export function ControlPanel() {
  const t = useTranslations('srt_player');
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

  const canPlay = useMemo(() => !!videoUrl && !!subtitleUrl && subtitleData.length > 0, [videoUrl, subtitleUrl, subtitleData]);
  const currentProgress = currentIndex ?? 0;
  const totalProgress = Math.max(0, subtitleData.length - 1);

  const handleVideoUpload = useCallback(() => {
    uploadVideo(setVideoUrl, (error) => {
      toast.error(t('videoUploadFailed') + ': ' + error.message);
    });
  }, [uploadVideo, setVideoUrl, t]);

  const handleSubtitleUpload = useCallback(() => {
    uploadSubtitle((url) => {
      setSubtitleUrl(url);
    }, (error) => {
      toast.error(t('subtitleUploadFailed') + ': ' + error.message);
    });
  }, [uploadSubtitle, setSubtitleUrl, t]);

  const handleSeek = useCallback((index: number) => {
    if (subtitleData[index]) {
      seek(subtitleData[index].start);
    }
  }, [subtitleData, seek]);

  const handlePlaybackRateChange = useCallback(() => {
    const rates = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
    const currentIndexRate = rates.indexOf(playbackRate);
    const nextIndexRate = (currentIndexRate + 1) % rates.length;
    setPlaybackRate(rates[nextIndexRate]);
  }, [playbackRate, setPlaybackRate]);

  return (
    <div className="p-3 bg-gray-50 border-t rounded-b-xl">
      <VStack gap={3}>
        <HStack gap={3}>
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
              <Button
                variant="secondary"
                onClick={videoUrl ? undefined : handleVideoUpload}
                disabled={!!videoUrl}
                size="sm"
              >
                {videoUrl ? t('uploaded') : t('upload')}
              </Button>
            </HStack>
          </div>

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
              <Button
                variant="secondary"
                onClick={subtitleUrl ? undefined : handleSubtitleUpload}
                disabled={!!subtitleUrl}
                size="sm"
              >
                {subtitleUrl ? t('uploaded') : t('upload')}
              </Button>
            </HStack>
          </div>
        </HStack>

        <VStack
          gap={4}
          className={!canPlay ? 'opacity-50 pointer-events-none' : ''}
        >
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

            <Button
              variant="secondary"
              onClick={toggleSettings}
              leftIcon={<Settings className="w-4 h-4" />}
            >
              {t('settings')}
            </Button>

            <Button
              variant="secondary"
              onClick={toggleShortcuts}
              leftIcon={<Keyboard className="w-4 h-4" />}
            >
              {t('shortcuts')}
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

            <HStack gap={4} justify="between" className="text-sm text-gray-600 px-2">
              <span>
                {currentIndex !== null ? `${currentIndex + 1}/${subtitleData.length}` : '0/0'}
              </span>

              <HStack gap={4}>
                <span className="bg-gray-200 px-2 py-1 rounded text-xs">
                  {playbackRate}x
                </span>

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

        {showSettings && (
          <div className="p-3 bg-white rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3">{t('subtitleSettings')}</h3>
            <VStack gap={3}>
              <HStack gap={2} className="w-full">
                <span className="text-sm text-gray-600 w-20">{t('fontSize')}</span>
                <Range
                  value={settings.fontSize}
                  min={12}
                  max={48}
                  onChange={(value) => updateSettings({ fontSize: value })}
                />
                <span className="text-sm text-gray-600 w-12">{settings.fontSize}px</span>
              </HStack>

              <HStack gap={2} className="w-full">
                <span className="text-sm text-gray-600 w-20">{t('textColor')}</span>
                <input
                  type="color"
                  value={settings.textColor}
                  onChange={(e) => updateSettings({ textColor: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer"
                />
              </HStack>

              <HStack gap={2} className="w-full">
                <span className="text-sm text-gray-600 w-20">{t('backgroundColor')}</span>
                <input
                  type="color"
                  value={settings.backgroundColor.replace(/rgba?\([^)]+\)/, '#000000')}
                  onChange={(e) => updateSettings({ backgroundColor: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer"
                />
              </HStack>

              <HStack gap={2} className="w-full">
                <span className="text-sm text-gray-600 w-20">{t('position')}</span>
                <HStack gap={2}>
                  {(['top', 'center', 'bottom'] as const).map((pos) => (
                    <Button
                      key={pos}
                      size="sm"
                      variant={settings.position === pos ? 'primary' : 'secondary'}
                      onClick={() => updateSettings({ position: pos })}
                    >
                      {t(pos)}
                    </Button>
                  ))}
                </HStack>
              </HStack>

              <HStack gap={2} className="w-full">
                <span className="text-sm text-gray-600 w-20">{t('opacity')}</span>
                <Range
                  value={settings.opacity}
                  min={0.1}
                  max={1}
                  step={0.1}
                  onChange={(value) => updateSettings({ opacity: value })}
                />
                <span className="text-sm text-gray-600 w-12">{Math.round(settings.opacity * 100)}%</span>
              </HStack>
            </VStack>
          </div>
        )}

        {showShortcuts && (
          <div className="p-3 bg-white rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3">{t('keyboardShortcuts')}</h3>
            <VStack gap={2}>
              {[
                { key: 'Space', desc: t('playPause') },
                { key: 'N', desc: t('next') },
                { key: 'P', desc: t('previous') },
                { key: 'R', desc: t('restart') },
                { key: 'A', desc: t('autoPauseToggle') },
              ].map((shortcut) => (
                <HStack key={shortcut.key} gap={2} justify="between" className="w-full">
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">{shortcut.key}</kbd>
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
