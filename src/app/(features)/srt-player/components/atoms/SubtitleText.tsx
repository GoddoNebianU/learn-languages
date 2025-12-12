"use client";

import React from "react";
import { SubtitleTextProps } from "../../types/subtitle";

export default function SubtitleText({ text, onWordClick, style, className }: SubtitleTextProps) {
  const handleWordClick = React.useCallback((word: string) => {
    onWordClick?.(word);
  }, [onWordClick]);

  // 将文本分割成单词，保持标点符号
  const renderTextWithClickableWords = () => {
    if (!text) return null;
    
    // 匹配单词和标点符号
    const parts = text.match(/[\w']+|[^\w\s]+|\s+/g) || [];
    
    return parts.map((part, index) => {
      // 如果是单词（字母和撇号组成）
      if (/^[\w']+$/.test(part)) {
        return (
          <span
            key={index}
            onClick={() => handleWordClick(part)}
            className="hover:bg-gray-700 hover:underline hover:cursor-pointer rounded px-1 transition-colors"
          >
            {part}
          </span>
        );
      }
      // 如果是空格或其他字符，直接渲染
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div 
      className={`overflow-auto h-16 mt-2 wrap-break-words font-sans text-white text-center text-2xl ${className || ''}`}
      style={style}
    >
      {renderTextWithClickableWords()}
    </div>
  );
}