"use client";

import React from "react";
import { SeekBarProps } from "../../types/player";

export default function SeekBar({ value, max, onChange, disabled, className }: SeekBarProps) {
  const handleChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(event.target.value);
    onChange(newValue);
  }, [onChange]);

  return (
    <input
      type="range"
      min={0}
      max={max}
      value={value}
      onChange={handleChange}
      disabled={disabled}
      className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className || ''}`}
      style={{
        background: `linear-gradient(to right, #374151 0%, #374151 ${(value / max) * 100}%, #e5e7eb ${(value / max) * 100}%, #e5e7eb 100%)`
      }}
    />
  );
}