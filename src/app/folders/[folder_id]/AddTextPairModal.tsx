import { LightButton } from "@/design-system/base/button/button";
import { Input } from "@/design-system/base/input/input";
import { LocaleSelector } from "@/components/ui/LocaleSelector";
import { X } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";

interface AddTextPairModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (
    text1: string,
    text2: string,
    language1: string,
    language2: string,
  ) => void;
}

export function AddTextPairModal({
  isOpen,
  onClose,
  onAdd,
}: AddTextPairModalProps) {
  const t = useTranslations("folder_id");
  const input1Ref = useRef<HTMLInputElement>(null);
  const input2Ref = useRef<HTMLInputElement>(null);
  const [language1, setLanguage1] = useState("english");
  const [language2, setLanguage2] = useState("chinese");

  if (!isOpen) return null;

  const handleAdd = () => {
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
      onAdd(text1, text2, language1, language2);
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
          handleAdd();
        }
      }}
    >
      <div className="bg-white rounded-md p-6 w-full max-w-md mx-4">
        <div className="flex">
          <h2 className="flex-1 text-xl font-light mb-4 text-center">
            {t("addNewTextPair")}
          </h2>
          <X onClick={onClose} className="hover:cursor-pointer"></X>
        </div>
        <div>
          <div>
            {t("text1")}
            <Input ref={input1Ref} className="w-full"></Input>
          </div>
          <div>
            {t("text2")}
            <Input ref={input2Ref} className="w-full"></Input>
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
        <LightButton onClick={handleAdd}>{t("add")}</LightButton>
      </div>
    </div>
  );
}
