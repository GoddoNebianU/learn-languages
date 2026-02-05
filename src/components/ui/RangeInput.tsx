"use client";

import React from "react";

interface RangeInputProps {
  value: number;
  max: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
  min?: number;
}

export function RangeInput({
  value,
  max,
  onChange,
  disabled = false,
  className = "",
  min = 0,
}: RangeInputProps) {
  const handleChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(event.target.value);
    onChange(newValue);
  }, [onChange]);

  const progressPercentage = ((value - min) / (max - min)) * 100;

  return (
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={handleChange}
      disabled={disabled}
      className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      style={{
        background: `linear-gradient(to right, #374151 0%, #374151 ${progressPercentage}%, #e5e7eb ${progressPercentage}%, #e5e7eb 100%)`
      }}
    />
  );
}
