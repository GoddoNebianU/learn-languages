import { useRef } from "react";

export default function useFileUpload(callback: (file: File) => void) {
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = (type: string = "*") => {
    const input = inputRef.current;
    if (input) {
      input.click();
      input.setAttribute("accept", type);
      input.onchange = () => {
        const file = input.files?.[0];
        if (file) callback(file);
      };
    }
  };
  return { upload, inputRef };
}
