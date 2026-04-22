"use client";

import { useState } from "react";
import z from "zod";
import { TextSpeakerArraySchema, TextSpeakerItemSchema } from "@/lib/interfaces";
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
    <div className="m-2 grid grid-cols-8 rounded-lg border-b border-gray-200 bg-gray-100 p-2">
      <div className="col-span-7" onClick={onUseClick}>
        <div className="max-h-26 overflow-y-auto text-3xl hover:cursor-pointer">{item.text}</div>
        <div className="max-h-16 overflow-x-auto overflow-y-auto text-xl whitespace-nowrap text-gray-600">
          {item.ipa}
        </div>
      </div>
      <div className="m-2 flex items-center justify-center border-l-2 border-gray-300">
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
  const { get: getFromLocalStorage, set: setIntoLocalStorage } = getLocalStorageOperator<
    typeof TextSpeakerArraySchema
  >("text-speaker", TextSpeakerArraySchema);
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
      <div className="mx-4 my-4 rounded-lg border border-gray-200 p-2 md:mx-32">
        <div className="mb-2 flex items-center justify-between">
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
            <TextCard key={i} item={item} handleUse={handleUse} handleDel={handleDel}></TextCard>
          ))}
        </ul>
      </div>
    );
  else return <></>;
}
