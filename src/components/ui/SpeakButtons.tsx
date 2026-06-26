"use client";

import { Volume2, RefreshCw } from "lucide-react";
import { IconButton } from "@/design-system/icon-button";

interface SpeakButtonsProps {
  text: string;
  playOrReplay: (text: string) => Promise<void>;
  regenerate: (text: string) => Promise<void>;
  isLoading: boolean;
  size?: number;
  className?: string;
}

export function SpeakButtons({
  text,
  playOrReplay,
  regenerate,
  isLoading,
  size = 16,
  className = "",
}: SpeakButtonsProps) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`}>
      <IconButton
        size={size + 4}
        onClick={() => playOrReplay(text)}
        loading={isLoading}
        aria-label="Play audio"
        className="text-gray-400 hover:text-primary-500"
      >
        <Volume2 size={size} />
      </IconButton>
      <IconButton
        size={size + 4}
        onClick={() => regenerate(text)}
        disabled={isLoading}
        aria-label="Regenerate audio"
        className="text-gray-300 hover:text-primary-500"
      >
        <RefreshCw size={size - 2} />
      </IconButton>
    </span>
  );
}
