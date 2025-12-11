"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Letter, SupportedAlphabets } from "@/lib/interfaces";
import IconClick from "@/components/ui/buttons/IconClick";
import IMAGES from "@/config/images";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface AlphabetCardProps {
  alphabet: Letter[];
  alphabetType: SupportedAlphabets;
  onBack: () => void;
}

export default function AlphabetCard({ alphabet, alphabetType, onBack }: AlphabetCardProps) {
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
    <div className="min-h-[calc(100vh-64px)] bg-[#35786f] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* 返回按钮 */}
        <div className="flex justify-end mb-4">
          <IconClick
            size={32}
            alt="close"
            src={IMAGES.close}
            onClick={onBack}
            className="bg-white rounded-full shadow-md"
          />
        </div>

        {/* 主卡片 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {/* 进度指示器 */}
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm text-gray-500">
              {currentIndex + 1} / {alphabet.length}
            </span>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setShowLetter(!showLetter)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  showLetter
                    ? "bg-[#35786f] text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {t("letter")}
              </button>
              <button
                onClick={() => setShowIPA(!showIPA)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  showIPA
                    ? "bg-[#35786f] text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                IPA
              </button>
              {hasRomanization && (
                <button
                  onClick={() => setShowRoman(!showRoman)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    showRoman
                      ? "bg-[#35786f] text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {t("roman")}
                </button>
              )}
              <button
                onClick={() => setIsRandomMode(!isRandomMode)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  isRandomMode
                    ? "bg-[#35786f] text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {t("random")}
              </button>
            </div>
          </div>

          {/* 字母显示区域 */}
          <div className="text-center mb-8">
            {showLetter ? (
              <div className="text-6xl md:text-8xl font-bold text-gray-800 mb-4">
                {currentLetter.letter}
              </div>
            ) : (
              <div className="text-6xl md:text-8xl font-bold text-gray-300 mb-4 h-20 md:h-24 flex items-center justify-center">
                <span className="text-2xl md:text-3xl text-gray-400">?</span>
              </div>
            )}
            
            {showIPA && (
              <div className="text-2xl md:text-3xl text-gray-600 mb-2">
                {currentLetter.letter_sound_ipa}
              </div>
            )}
            
            {showRoman && hasRomanization && currentLetter.roman_letter && (
              <div className="text-lg md:text-xl text-gray-500">
                {currentLetter.roman_letter}
              </div>
            )}
          </div>

          {/* 导航控制 */}
          <div className="flex justify-between items-center">
            <button
              onClick={goToPrevious}
              className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label="上一个字母"
            >
              <ChevronLeft size={24} />
            </button>

            <div className="flex gap-2 items-center">
              {isRandomMode ? (
                <button
                  onClick={goToRandom}
                  className="px-4 py-2 rounded-full bg-[#35786f] text-white text-sm font-medium hover:bg-[#2d5f58] transition-colors"
                >
                  {t("randomNext")}
                </button>
              ) : (
                <div className="flex gap-1 flex-wrap max-w-xs justify-center">
                  {alphabet.slice(0, 20).map((_, index) => (
                    <div
                      key={index}
                      className={`h-2 rounded-full transition-all ${
                        index === currentIndex
                          ? "w-8 bg-[#35786f]"
                          : "w-2 bg-gray-300"
                      }`}
                    />
                  ))}
                  {alphabet.length > 20 && (
                    <div className="text-xs text-gray-500 flex items-center">...</div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={goToNext}
              className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label="下一个字母"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        {/* 操作提示 */}
        <div className="text-center mt-6 text-white text-sm">
          <p>
            {isRandomMode
              ? "使用左右箭头键或空格键随机切换字母，ESC键返回"
              : "使用左右箭头键或滑动切换字母，ESC键返回"
            }
          </p>
        </div>
      </div>

      {/* 触摸事件处理 */}
      <div
        className="absolute inset-0 pointer-events-none"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      />
    </div>
  );
}