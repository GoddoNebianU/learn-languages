"use client";

import React from "react";
import { SeekBarProps } from "../../types/player";
import { RangeInput } from "@/design-system/base/range";

export function SeekBar({ value, max, onChange, disabled, className }: SeekBarProps) {
  return (
    <RangeInput
      value={value}
      max={max}
      onChange={onChange}
      disabled={disabled}
      className={className}
    />
  );
}