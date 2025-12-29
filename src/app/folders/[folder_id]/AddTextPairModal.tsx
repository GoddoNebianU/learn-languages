import { LightButton } from "@/components/ui/buttons";
import Input from "@/components/ui/Input";
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
    locale1: string,
    locale2: string,
  ) => void;
}

export default function AddTextPairModal({
  isOpen,
  onClose,
  onAdd,
}: AddTextPairModalProps) {
  const t = useTranslations("folder_id");
  const input1Ref = useRef<HTMLInputElement>(null);
  const input2Ref = useRef<HTMLInputElement>(null);
  const [locale1, setLocale1] = useState("en-US");
  const [locale2, setLocale2] = useState("zh-CN");

  if (!isOpen) return null;

  const handleAdd = () => {
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
      onAdd(text1, text2, locale1, locale2);
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
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
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
            {t("locale1")}
            <LocaleSelector value={locale1} onChange={setLocale1} />
          </div>
          <div>
            {t("locale2")}
            <LocaleSelector value={locale2} onChange={setLocale2} />
          </div>
        </div>
        <LightButton onClick={handleAdd}>{t("add")}</LightButton>
      </div>
    </div>
  );
}
