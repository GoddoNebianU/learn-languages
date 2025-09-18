import { useRef, useState } from "react";
import Button from "../../../components/Button";

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

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [SrtFile, setSrtFile] = useState<File | null>(null);

  const uploadVideo = () => {
    const input = inputRef.current;
    if (input) {
      input.setAttribute('accept', 'video/*');
      input.click();
      input.onchange = () => {
        const file = input.files?.[0];
        if (file) {
          setVideoFile(file);
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
          setSrtFile(file);
          setSrtUrl(URL.createObjectURL(file));
        }
      };
    }
  }
  return (
    <div className="flex flex-col">
      <table className="border border-black border-collapse">
        <thead>
          <tr className="divide-x divide-black">
            <th className="border border-black px-2 py-1">File Name</th>
            <th className="border border-black px-2 py-1">Type</th>
            <th className="border border-black px-2 py-1">Size</th>
            <th className="border border-black px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black">
          <tr className="divide-x divide-black">
            <td className="px-2 py-1">{videoFile?.name}</td>
            <td className="px-2 py-1">Video</td>
            <td className="px-2 py-1">{videoFile ? (videoFile.size / 1024 / 1024).toFixed(2) + 'MB' : null}</td>
            <td className="px-2 py-1"><Button label="Upload" onClick={uploadVideo} /></td>
          </tr>
          <tr className="divide-x divide-black">
            <td className="px-2 py-1">{SrtFile?.name}</td>
            <td className="px-2 py-1">SRT</td>
            <td className="px-2 py-1">{SrtFile ? (SrtFile.size / 1024 / 1024).toFixed(2) + 'MB' : null}</td>
            <td className="px-2 py-1"><Button label="Upload" onClick={uploadSRT} /></td>
          </tr>
        </tbody>
      </table>
      <input type="file" className="hidden" ref={inputRef} />
    </div>
  )
}