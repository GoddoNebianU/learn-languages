import { LightButton } from "@/components/ui/buttons";
import Input from "@/components/ui/Input";
import { LocaleSelector } from "@/components/ui/LocaleSelector";
import { X } from "lucide-react";
import { useRef, useState } from "react";
import { PairUpdateInput } from "../../../../generated/prisma/models";
import { TextPair } from "./InFolder";
import { useTranslations } from "next-intl";

interface UpdateTextPairModalProps {
  isOpen: boolean;
  onClose: () => void;
  textPair: TextPair;
  onUpdate: (id: number, tp: PairUpdateInput) => void;
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
  const [locale1, setLocale1] = useState(textPair.locale1);
  const [locale2, setLocale2] = useState(textPair.locale2);

  if (!isOpen) return null;

  const handleUpdate = () => {
    if (
      !input1Ref.current?.value ||
      !input2Ref.current?.value ||
      !locale1 ||
      !locale2
    )
      return;

    const text1 = input1Ref.current.value;
    const text2 = input2Ref.current.value;

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
            <LocaleSelector value={locale1} onChange={setLocale1} />
          </div>
          <div>
            {t("locale2")}
            <LocaleSelector value={locale2} onChange={setLocale2} />
          </div>
        </div>
        <LightButton onClick={handleUpdate}>{t("update")}</LightButton>
      </div>
    </div>
  );
}
