"use client";

import React from "react";
import { SubtitleDisplayProps } from "../../types/subtitle";
import SubtitleText from "../atoms/SubtitleText";

export default function SubtitleArea({ subtitle, onWordClick, settings, className }: SubtitleDisplayProps) {
  const handleWordClick = React.useCallback((word: string) => {
    // 打开有道词典页面查询单词
    window.open(
      `https://www.youdao.com/result?word=${encodeURIComponent(word)}&lang=en`,
      "_blank"
    );
    onWordClick?.(word);
  }, [onWordClick]);

  const subtitleStyle = React.useMemo(() => {
    if (!settings) return { backgroundColor: 'rgba(0, 0, 0, 0.5)' };
    
    return {
      backgroundColor: settings.backgroundColor,
      color: settings.textColor,
      fontSize: `${settings.fontSize}px`,
      fontFamily: settings.fontFamily,
      opacity: settings.opacity,
    };
  }, [settings]);

  return (
    <SubtitleText
      text={subtitle}
      onWordClick={handleWordClick}
      style={subtitleStyle}
      className={className}
    />
  );
}