import LightButton from "@/components/buttons/LightButton";
import Input from "@/components/Input";
import { X } from "lucide-react";
import { useRef } from "react";
import { text_pairUpdateInput } from "../../../../generated/prisma/models";
import { TextPair } from "./InFolder";
import { useTranslations } from "next-intl";

interface UpdateTextPairModalProps {
  isOpen: boolean;
  onClose: () => void;
  textPair: TextPair;
  onUpdate: (id: number, tp: text_pairUpdateInput) => void;
}

export default function UpdateTextPairModal({
  isOpen,
  onClose,
  onUpdate,
  textPair,
}: UpdateTextPairModalProps) {
  const t = useTranslations("folder_id");
  const input1Ref = useRef<HTMLInputElement>(null);
  const input2Ref = useRef<HTMLInputElement>(null);
  const input3Ref = useRef<HTMLInputElement>(null);
  const input4Ref = useRef<HTMLInputElement>(null);
  if (!isOpen) return null;

  const handleUpdate = () => {
    if (
      !input1Ref.current?.value ||
      !input2Ref.current?.value ||
      !input3Ref.current?.value ||
      !input4Ref.current?.value
    )
      return;

    const text1 = input1Ref.current.value;
    const text2 = input2Ref.current.value;
    const locale1 = input3Ref.current.value;
    const locale2 = input4Ref.current.value;
    if (
      typeof text1 === "string" &&
      typeof text2 === "string" &&
      typeof locale1 === "string" &&
      typeof locale2 === "string" &&
      text1.trim() !== "" &&
      text2.trim() !== "" &&
      locale1.trim() !== "" &&
      locale2.trim() !== ""
    ) {
      onUpdate(textPair.id, { text1, text2, locale1, locale2 });
      input1Ref.current.value = "";
      input2Ref.current.value = "";
    }
  };
  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center z-50"
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          handleUpdate();
        }
      }}
    >
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex">
          <h2 className="flex-1 text-xl font-light mb-4 text-center">
            {t("updateTextPair")}
          </h2>
          <X onClick={onClose} className="hover:cursor-pointer"></X>
        </div>
        <div>
          <div>
            {t("text1")}
            <Input
              defaultValue={textPair.text1}
              ref={input1Ref}
              className="w-full"
            ></Input>
          </div>
          <div>
            {t("text2")}
            <Input
              defaultValue={textPair.text2}
              ref={input2Ref}
              className="w-full"
            ></Input>
          </div>
          <div>
            {t("locale1")}
            <Input
              defaultValue={textPair.locale1}
              ref={input3Ref}
              className="w-full"
            ></Input>
          </div>
          <div>
            {t("locale2")}
            <Input
              defaultValue={textPair.locale2}
              ref={input4Ref}
              className="w-full"
            ></Input>
          </div>
        </div>
        <LightButton onClick={handleUpdate}>{t("update")}</LightButton>
      </div>
    </div>
  );
}
