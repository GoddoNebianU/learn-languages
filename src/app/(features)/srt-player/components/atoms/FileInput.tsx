"use client";

import React, { useRef } from "react";
import { Button } from "@/design-system/base/button";
import { FileInputProps } from "../../types/controls";

interface FileInputComponentProps extends FileInputProps {
  children: React.ReactNode;
}

export function FileInput({ accept, onFileSelect, disabled, className, children }: FileInputComponentProps) {
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
      <Button
        onClick={handleClick}
        disabled={disabled}
        variant="secondary"
        size="sm"
        className={className}
      >
        {children}
      </Button>
    </>
  );
}