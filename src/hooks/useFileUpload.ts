"use client";

import { useRef, useCallback } from "react";

export function useFileUpload(callback: (file: File) => void) {
  const inputRef = useRef<HTMLInputElement>(null);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const upload = useCallback((type: string = "*") => {
    const input = inputRef.current;
    if (!input) return;

    input.value = "";
    input.setAttribute("accept", type);

    const handler = () => {
      const file = input.files?.[0];
      if (file) callbackRef.current(file);
      input.removeEventListener("change", handler);
    };

    input.addEventListener("change", handler);
    input.click();
  }, []);

  return { upload, inputRef };
}
