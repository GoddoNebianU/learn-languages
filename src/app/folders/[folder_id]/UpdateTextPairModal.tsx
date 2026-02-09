import { LightButton } from "@/design-system/base/button";
import { Input } from "@/design-system/base/input";
import { LocaleSelector } from "@/components/ui/LocaleSelector";
import { X } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { TSharedPair } from "@/shared/folder-type";
import { ActionInputUpdatePairById } from "@/modules/folder/folder-action-dto";

interface UpdateTextPairModalProps {
  isOpen: boolean;
  onClose: () => void;
  textPair: TSharedPair;
  onUpdate: (id: number, tp: ActionInputUpdatePairById) => void;
}

export function UpdateTextPairModal({
  isOpen,
  onClose,
  onUpdate,
  textPair,
}: UpdateTextPairModalProps) {
  const t = useTranslations("folder_id");
  const input1Ref = useRef<HTMLInputElement>(null);
  const input2Ref = useRef<HTMLInputElement>(null);
  const [language1, setLanguage1] = useState(textPair.language1);
  const [language2, setLanguage2] = useState(textPair.language2);

  if (!isOpen) return null;

  const handleUpdate = () => {
    if (
      !input1Ref.current?.value ||
      !input2Ref.current?.value ||
      !language1 ||
      !language2
    )
      return;

    const text1 = input1Ref.current.value;
    const text2 = input2Ref.current.value;

    if (
      typeof text1 === "string" &&
      typeof text2 === "string" &&
      typeof language1 === "string" &&
      typeof language2 === "string" &&
      text1.trim() !== "" &&
      text2.trim() !== "" &&
      language1.trim() !== "" &&
      language2.trim() !== ""
    ) {
      onUpdate(textPair.id, { text1, text2, language1, language2 });
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
      <div className="bg-white rounded-md p-6 w-full max-w-md mx-4">
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
            {t("language1")}
            <LocaleSelector value={language1} onChange={setLanguage1} />
          </div>
          <div>
            {t("language2")}
            <LocaleSelector value={language2} onChange={setLanguage2} />
          </div>
        </div>
        <LightButton onClick={handleUpdate}>{t("update")}</LightButton>
      </div>
    </div>
  );
}
