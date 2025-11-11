"use client";

import { getTextPairsByFolderId } from "@/lib/controllers/TextPairController";
import { useEffect, useState } from "react";

interface Props {
  username: string;
  folderId: number;
}

interface TextPair {
  id: number;
  text1: string;
  text2: string;
  locale1: string;
  locale2: string;
}

export default function InFolder({ folderId }: Props) {
  const [textPairs, setTextPairs] = useState<TextPair[]>([]);

  useEffect(() => {
    getTextPairsByFolderId(folderId).then((textPairs) => {
      setTextPairs(textPairs as TextPair[]);
    });
  }, [folderId, textPairs]);

  const updateTextPairs = async () => {
    const updatedTextPairs = await getTextPairsByFolderId(folderId);
    setTextPairs(updatedTextPairs as TextPair[]);
  };
  
  return (
    <div>
      <h1>In Folder</h1>
    </div>
  );
}
