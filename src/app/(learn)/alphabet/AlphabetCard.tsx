"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Letter, SupportedAlphabets } from "@/lib/interfaces";
import { Button } from "@/design-system/button"
import { IconButton } from "@/design-system/icon-button";
import { IMAGES } from "@/config/images";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageLayout } from "@/components/ui/PageLayout";
import { Card } from "@/design-system/card";

interface AlphabetCardProps {
  alphabet: Letter[];
  alphabetType: SupportedAlphabets;
  onBack: () => void;
}

export function AlphabetCard({ alphabet, alphabetType, onBack }: AlphabetCardProps) {
  const t = useTranslations("alphabet");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showIPA, setShowIPA] = useState(true);
  const [showLetter, setShowLetter] = useState(true);
  const [showRoman, setShowRoman] = useState(false);
  const [isRandomMode, setIsRandomMode] = useState(false);
  
  // 只有日语假名显示罗马音按钮
  const hasRomanization = alphabetType === "japanese";

  const currentLetter = alphabet[currentIndex];


  const goToNext = useCallback(() => {
    if (isRandomMode) {
      setCurrentIndex(Math.floor(Math.random() * alphabet.length));
    } else {
      setCurrentIndex((prev) => (prev === alphabet.length - 1 ? 0 : prev + 1));
    }
  }, [alphabet.length, isRandomMode]);

  const goToPrevious = useCallback(() => {
    if (isRandomMode) {
      setCurrentIndex(Math.floor(Math.random() * alphabet.length));
    } else {
      setCurrentIndex((prev) => (prev === 0 ? alphabet.length - 1 : prev - 1));
    }
  }, [alphabet.length, isRandomMode]);

  const goToRandom = useCallback(() => {
    setCurrentIndex(Math.floor(Math.random() * alphabet.length));
  }, [alphabet.length]);

  // 键盘快捷键支持
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        goToPrevious();
      } else if (e.key === "ArrowRight") {
        goToNext();
      } else if (e.key === " ") {
        e.preventDefault();
        goToRandom();
      } else if (e.key === "Escape") {
        onBack();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [goToPrevious, goToNext, goToRandom, onBack]);

  // 触摸滑动支持
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    }
    if (isRightSwipe) {
      goToPrevious();
    }
  };

  return (
    <PageLayout className="relative">
      {/* 右上角返回按钮 - outside the white card */}
      <div className="flex justify-end mb-4">
        <IconButton
          size={32}
          iconAlt="close"
          iconSrc={IMAGES.close}
          onClick={onBack}
          className="bg-white rounded-full shadow-md"
        />
      </div>

      {/* 白色主卡片容器 */}
      <Card padding="xl">
        {/* 顶部进度指示器和显示选项按钮 */}
        <div className="flex justify-between items-center mb-6">
          {/* 当前字母进度 */}
          <span className="text-sm text-gray-500">
            {currentIndex + 1} / {alphabet.length}
          </span>
          {/* 显示选项切换按钮组 */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="light"
              selected={showLetter}
              onClick={() => setShowLetter(!showLetter)}
              className="rounded-full px-3 py-1 text-sm transition-colors"
            >
              {t("letter")}
            </Button>
            {/* IPA 音标显示切换 */}
            <Button
              variant="light"
              selected={showIPA}
              onClick={() => setShowIPA(!showIPA)}
              className="rounded-full px-3 py-1 text-sm transition-colors"
            >
              IPA
            </Button>
            {/* 罗马音显示切换（仅日语显示） */}
            {hasRomanization && (
              <Button
                variant="light"
                selected={showRoman}
                onClick={() => setShowRoman(!showRoman)}
                className="rounded-full px-3 py-1 text-sm transition-colors"
              >
                {t("roman")}
              </Button>
            )}
            {/* 随机模式切换 */}
            <Button
              variant="light"
              selected={isRandomMode}
              onClick={() => setIsRandomMode(!isRandomMode)}
              className="rounded-full px-3 py-1 text-sm transition-colors"
            >
              {t("random")}
            </Button>
          </div>
        </div>

        {/* 字母主要内容显示区域 */}
        <div className="text-center mb-8">
          {/* 字母本身（可隐藏） */}
          {showLetter ? (
            <div className="text-6xl md:text-8xl font-bold text-gray-800 mb-4">
              {currentLetter.letter}
            </div>
          ) : (
            <div className="text-6xl md:text-8xl font-bold text-gray-300 mb-4 h-20 md:h-24 flex items-center justify-center">
              <span className="text-2xl md:text-3xl text-gray-400">?</span>
            </div>
          )}

          {/* IPA 音标显示 */}
          {showIPA && (
            <div className="text-2xl md:text-3xl text-gray-600 mb-2">
              {currentLetter.letter_sound_ipa}
            </div>
          )}

          {/* 罗马音显示（日语） */}
          {showRoman && hasRomanization && currentLetter.roman_letter && (
            <div className="text-lg md:text-xl text-gray-500">
              {currentLetter.roman_letter}
            </div>
          )}
        </div>

        {/* 底部导航控制区域 */}
        <div className="flex justify-between items-center">
          {/* 上一个按钮 */}
          <IconButton className="rounded-full" onClick={goToPrevious} aria-label={t("previousLetter")}>
            <ChevronLeft size={20} />
          </IconButton>

          {/* 中间区域：随机按钮 */}
          <div className="flex gap-2 items-center">
            {isRandomMode && (
              <Button
                variant="primary"
                onClick={goToRandom}
                className="rounded-full px-4 py-2 text-sm"
              >
                {t("randomNext")}
              </Button>
            )}
          </div>

          {/* 下一个按钮 */}
          <IconButton className="rounded-full" onClick={goToNext} aria-label={t("nextLetter")}>
            <ChevronRight size={20} />
          </IconButton>
        </div>
      </Card>

      {/* 底部操作提示文字 */}
      <div className="text-center mt-6 text-white text-sm">
        <p>
          {isRandomMode
            ? t("keyboardHint")
            : t("swipeHint")
          }
        </p>
      </div>

      {/* 全屏触摸事件监听层（用于滑动切换） */}
      <div
        className="absolute inset-0 pointer-events-none"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      />
    </PageLayout>
  );
}