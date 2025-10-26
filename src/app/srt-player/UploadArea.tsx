import Button from "@/components/Button";
import { useRef } from "react";

export default function UploadArea(
  {
    setVideoUrl,
    setSrtUrl
  }: {
    setVideoUrl: (url: string | null) => void;
    setSrtUrl: (url: string | null) => void;
  }
) {
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadVideo = () => {
    const input = inputRef.current;
    if (input) {
      input.setAttribute('accept', 'video/*');
      input.click();
      input.onchange = () => {
        const file = input.files?.[0];
        if (file) {
          setVideoUrl(URL.createObjectURL(file));
        }
      };
    }
  }
  const uploadSRT = () => {
    const input = inputRef.current;
    if (input) {
      input.setAttribute('accept', '.srt');
      input.click();
      input.onchange = () => {
        const file = input.files?.[0];
        if (file) {
          setSrtUrl(URL.createObjectURL(file));
        }
      };
    }
  }
  return (
    <div className="w-full flex flex-col gap-2 m-2">
      <Button onClick={uploadVideo}>上传视频</Button>
      <Button onClick={uploadSRT}>上传字幕</Button>
      <input type="file" className="hidden" ref={inputRef} />
    </div >
  )
}