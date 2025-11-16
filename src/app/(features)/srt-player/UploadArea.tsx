import LightButton from "@/components/buttons/LightButton";
import { useRef } from "react";
import { useTranslations } from "next-intl";

export default function UploadArea({
  setVideoUrl,
  setSrtUrl,
}: {
  setVideoUrl: (url: string | null) => void;
  setSrtUrl: (url: string | null) => void;
}) {
  const t = useTranslations("srt_player");
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadVideo = () => {
    const input = inputRef.current;
    if (input) {
      input.setAttribute("accept", "video/*");
      input.click();
      input.onchange = () => {
        const file = input.files?.[0];
        if (file) {
          setVideoUrl(URL.createObjectURL(file));
        }
      };
    }
  };
  const uploadSRT = () => {
    const input = inputRef.current;
    if (input) {
      input.setAttribute("accept", ".srt");
      input.click();
      input.onchange = () => {
        const file = input.files?.[0];
        if (file) {
          setSrtUrl(URL.createObjectURL(file));
        }
      };
    }
  };
  return (
    <div className="w-full flex flex-col gap-2 m-2">
      <LightButton onClick={uploadVideo}>{t("uploadVideo")}</LightButton>
      <LightButton onClick={uploadSRT}>{t("uploadSubtitle")}</LightButton>
      <input type="file" className="hidden" ref={inputRef} />
    </div>
  );
}
