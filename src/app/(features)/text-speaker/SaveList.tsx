"use client";

import { getLocalStorageOperator } from "@/lib/utils";
import { useState } from "react";
import z from "zod";
import {
  TextSpeakerArraySchema,
  TextSpeakerItemSchema,
} from "@/lib/interfaces";
import IconClick from "@/components/IconClick";
import IMAGES from "@/config/images";
import { useTranslations } from "next-intl";

interface TextCardProps {
  item: z.infer<typeof TextSpeakerItemSchema>;
  handleUse: (item: z.infer<typeof TextSpeakerItemSchema>) => void;
  handleDel: (item: z.infer<typeof TextSpeakerItemSchema>) => void;
}
function TextCard({ item, handleUse, handleDel }: TextCardProps) {
  const onUseClick = () => {
    handleUse(item);
  };
  const onDelClick = () => {
    handleDel(item);
  };
  return (
    <div className="p-2 border-b border-gray-200 rounded-2xl bg-gray-100 m-2 grid grid-cols-8">
      <div className="col-span-7" onClick={onUseClick}>
        <div className="max-h-26 hover:cursor-pointer text-3xl overflow-y-auto">
          {item.text}
        </div>
        <div className="max-h-16 overflow-y-auto text-xl text-gray-600 whitespace-nowrap overflow-x-auto">
          {item.ipa}
        </div>
      </div>
      <div className="flex justify-center items-center border-gray-300 border-l-2 m-2">
        <IconClick
          src={IMAGES.delete}
          alt="delete"
          onClick={onDelClick}
          className="place-self-center"
          size={42}
        ></IconClick>
      </div>
    </div>
  );
}

interface SaveListProps {
  show?: boolean;
  handleUse: (item: z.infer<typeof TextSpeakerItemSchema>) => void;
}
export default function SaveList({ show = false, handleUse }: SaveListProps) {
  const t = useTranslations("text-speaker");
  const { get: getFromLocalStorage, set: setIntoLocalStorage } =
    getLocalStorageOperator<typeof TextSpeakerArraySchema>(
      "text-speaker",
      TextSpeakerArraySchema,
    );
  const [data, setData] = useState(getFromLocalStorage());
  const handleDel = (item: z.infer<typeof TextSpeakerItemSchema>) => {
    const current_data = getFromLocalStorage();

    current_data.splice(
      current_data.findIndex((v) => v.text === item.text),
      1,
    );
    setIntoLocalStorage(current_data);
    refresh();
  };
  const refresh = () => {
    setData(getFromLocalStorage());
  };
  const handleDeleteAll = () => {
    const yesorno = prompt(t("confirmDeleteAll"))?.trim();
    if (yesorno && (yesorno === "Y" || yesorno === "y")) {
      setIntoLocalStorage([]);
      refresh();
    }
  };
  if (show)
    return (
      <div
        className="my-4 p-2 mx-4 md:mx-32 border border-gray-200 rounded-2xl"
        style={{ fontFamily: "Times New Roman, serif" }}
      >
        <div className="flex flex-row justify-center gap-8 items-center">
          <IconClick
            src={IMAGES.refresh}
            alt="refresh"
            onClick={refresh}
            size={48}
            className=""
          ></IconClick>
          <IconClick
            src={IMAGES.delete}
            alt="delete"
            onClick={handleDeleteAll}
            size={48}
            className=""
          ></IconClick>
        </div>
        <ul>
          {data.map((v) => (
            <TextCard
              item={v}
              key={crypto.randomUUID()}
              handleUse={handleUse}
              handleDel={handleDel}
            ></TextCard>
          ))}
        </ul>
      </div>
    );
  else return <></>;
}
