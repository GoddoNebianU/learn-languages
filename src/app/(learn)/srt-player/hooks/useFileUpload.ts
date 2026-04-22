"use client";

import { useCallback } from "react";

export function useFileUpload() {
  const uploadFile = useCallback(
    (file: File, onSuccess: (url: string) => void, onError?: (error: Error) => void) => {
      try {
        const maxSize = 1000 * 1024 * 1024;
        if (file.size > maxSize) {
          throw new Error(`文件大小超过限制 (${(file.size / 1024 / 1024).toFixed(2)}MB > 1000MB)`);
        }

        const url = URL.createObjectURL(file);
        onSuccess(url);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "文件上传失败";
        onError?.(new Error(errorMessage));
      }
    },
    []
  );

  const uploadVideo = useCallback(
    (onVideoUpload: (url: string) => void, onError?: (error: Error) => void) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "video/*";

      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          if (!file.type.startsWith("video/")) {
            onError?.(new Error("请选择有效的视频文件"));
            return;
          }
          uploadFile(file, onVideoUpload, onError);
        }
      };

      input.onerror = () => {
        onError?.(new Error("文件选择失败"));
      };

      input.click();
    },
    [uploadFile]
  );

  const uploadSubtitle = useCallback(
    (onSubtitleUpload: (url: string) => void, onError?: (error: Error) => void) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".srt";

      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          if (!file.name.toLowerCase().endsWith(".srt")) {
            onError?.(new Error("请选择.srt格式的字幕文件"));
            return;
          }
          uploadFile(file, onSubtitleUpload, onError);
        }
      };

      input.onerror = () => {
        onError?.(new Error("文件选择失败"));
      };

      input.click();
    },
    [uploadFile]
  );

  return {
    uploadVideo,
    uploadSubtitle,
  };
}
