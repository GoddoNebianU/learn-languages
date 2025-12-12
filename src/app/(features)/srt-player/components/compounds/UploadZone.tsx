"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Video, FileText } from "lucide-react";
import DarkButton from "@/components/ui/buttons/DarkButton";
import { FileUploadProps } from "../../types/controls";
import { useFileUpload } from "../../hooks/useFileUpload";

export default function UploadZone({ onVideoUpload, onSubtitleUpload, className }: FileUploadProps) {
  const t = useTranslations("srt_player");
  const { uploadVideo, uploadSubtitle } = useFileUpload();

  const handleVideoUpload = React.useCallback(() => {
    uploadVideo(onVideoUpload, (error) => {
      toast.error(t("videoUploadFailed") + ": " + error.message);
    });
  }, [uploadVideo, onVideoUpload, t]);

  const handleSubtitleUpload = React.useCallback(() => {
    uploadSubtitle(onSubtitleUpload, (error) => {
      toast.error(t("subtitleUploadFailed") + ": " + error.message);
    });
  }, [uploadSubtitle, onSubtitleUpload, t]);

  return (
    <div className={`flex gap-3 ${className || ''}`}>
      <DarkButton
        onClick={handleVideoUpload}
        className="flex-1 py-2 px-3 text-sm"
      >
        <Video className="w-4 h-4 mr-2" />
        {t("uploadVideo")}
      </DarkButton>
      
      <DarkButton
        onClick={handleSubtitleUpload}
        className="flex-1 py-2 px-3 text-sm"
      >
        <FileText className="w-4 h-4 mr-2" />
        {t("uploadSubtitle")}
      </DarkButton>
    </div>
  );
}