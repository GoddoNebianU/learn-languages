"use client";

import React, { useRef } from "react";
import { FileInputProps } from "../../types/controls";

interface FileInputComponentProps extends FileInputProps {
  children: React.ReactNode;
}

export default function FileInput({ accept, onFileSelect, disabled, className, children }: FileInputComponentProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = React.useCallback(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  }, [disabled]);

  const handleChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        disabled={disabled}
        className="hidden"
      />
      <button
        onClick={handleClick}
        disabled={disabled}
        className={`px-2 py-1 rounded shadow font-bold hover:cursor-pointer hover:bg-gray-200 text-gray-800 bg-white ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className || ''}`}
      >
        {children}
      </button>
    </>
  );
}