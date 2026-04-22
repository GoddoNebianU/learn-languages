"use client";

import { useState } from "react";
import z from "zod";
import {
  TextSpeakerArraySchema,
  TextSpeakerItemSchema,
} from "@/lib/interfaces";
import { LinkButton } from "@/design-system/link-button";
import { IconButton } from "@/design-system/icon-button";
import { IMAGES } from "@/config/images";
import { useTranslations } from "next-intl";
import { getLocalStorageOperator } from "@/lib/browser/localStorageOperators";

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
    <div className="p-2 border-b border-gray-200 rounded-lg bg-gray-100 m-2 grid grid-cols-8">
      <div className="col-span-7" onClick={onUseClick}>
        <div className="max-h-26 hover:cursor-pointer text-3xl overflow-y-auto">
          {item.text}
        </div>
        <div className="max-h-16 overflow-y-auto text-xl text-gray-600 whitespace-nowrap overflow-x-auto">
          {item.ipa}
        </div>
      </div>
      <div className="flex justify-center items-center border-gray-300 border-l-2 m-2">
        <IconButton
          iconSrc={IMAGES.delete}
          iconAlt="delete"
          onClick={onDelClick}
          className="place-self-center"
          size={28}
        ></IconButton>
      </div>
    </div>
  );
}

interface SaveListProps {
  show?: boolean;
  handleUse: (item: z.infer<typeof TextSpeakerItemSchema>) => void;
}
export function SaveList({ show = false, handleUse }: SaveListProps) {
  const t = useTranslations("text_speaker");
  const { get: getFromLocalStorage, set: setIntoLocalStorage } =
    getLocalStorageOperator<typeof TextSpeakerArraySchema>(
      "text-speaker",
      TextSpeakerArraySchema,
    );
  const [data, setData] = useState(getFromLocalStorage());
  const handleDel = (item: z.infer<typeof TextSpeakerItemSchema>) => {
    const current_data = getFromLocalStorage();
    if (!current_data) return;

    const index = current_data.findIndex((v) => v.text === item.text);
    if (index === -1) return;
    
    current_data.splice(index, 1);
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
  if (show && data)
    return (
      <div
        className="my-4 p-2 mx-4 md:mx-32 border border-gray-200 rounded-lg"
      >
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-gray-600">{t("saved")}</p>
          <LinkButton
            onClick={handleDeleteAll}
            className="text-xs text-gray-500 hover:text-gray-800"
          >
            {t("clearAll")}
          </LinkButton>
        </div>
        <ul className="divide-y divide-gray-100">
          {data.map((item, i) => (
            <TextCard
              key={i}
              item={item}
              handleUse={handleUse}
              handleDel={handleDel}
            ></TextCard>
          ))}
        </ul>
      </div>
    );
  else return <></>;
}
