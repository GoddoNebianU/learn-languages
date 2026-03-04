"use client";

import { loadSubtitle } from "./subtitleParser";

const createUploadHandler = <T,>(
  accept: string,
  validate: (file: File) => boolean,
  errorMessage: string,
  processFile: (file: File) => T | Promise<T>
) => {
  return ((
    onSuccess: (result: T) => void,
    onError?: (error: Error) => void
  ) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        if (!validate(file)) {
          onError?.(new Error(errorMessage));
          return;
        }
        try {
          const result = await processFile(file);
          onSuccess(result);
        } catch (error) {
          onError?.(error instanceof Error ? error : new Error('文件处理失败'));
        }
      }
    };

    input.onerror = () => {
      onError?.(new Error('文件选择失败'));
    };

    input.click();
  });
};

export function useFileUpload() {
  const uploadVideo = createUploadHandler(
    'video/*',
    (file) => file.type.startsWith('video/'),
    '请选择有效的视频文件',
    (file) => URL.createObjectURL(file)
  );

  const uploadSubtitle = createUploadHandler(
    '.srt',
    (file) => file.name.toLowerCase().endsWith('.srt'),
    '请选择.srt格式的字幕文件',
    async (file) => {
      const url = URL.createObjectURL(file);
      return loadSubtitle(url);
    }
  );

  return {
    uploadVideo,
    uploadSubtitle,
  };
}