import { useTranslations } from "next-intl";
import { useState } from "react";
import { Input } from "@/design-system/input";
import { Select } from "@/design-system/select";
import { VStack } from "@/design-system/stack";

const COMMON_LANGUAGES = [
  { label: "chinese", value: "chinese" },
  { label: "english", value: "english" },
  { label: "italian", value: "italian" },
  { label: "japanese", value: "japanese" },
  { label: "korean", value: "korean" },
  { label: "french", value: "french" },
  { label: "german", value: "german" },
  { label: "spanish", value: "spanish" },
  { label: "portuguese", value: "portuguese" },
  { label: "russian", value: "russian" },
  { label: "other", value: "other" },
] as const;

interface LocaleSelectorProps {
  value: string;
  onChange: (val: string) => void;
}

export function LocaleSelector({ value, onChange }: LocaleSelectorProps) {
  const t = useTranslations();
  const [customInput, setCustomInput] = useState("");
  const isCommonLanguage = COMMON_LANGUAGES.some((l) => l.value === value && l.value !== "other");
  const showCustomInput = value === "other" || !isCommonLanguage;

  const inputValue = value === "other" ? customInput : value;

  const handleCustomInputChange = (inputValue: string) => {
    setCustomInput(inputValue);
    onChange(inputValue);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    if (selectedValue === "other") {
      setCustomInput("");
      onChange("other");
    } else {
      onChange(selectedValue);
    }
  };

  return (
    <VStack gap={2}>
      <Select value={isCommonLanguage ? value : "other"} onChange={handleSelectChange}>
        {COMMON_LANGUAGES.map((lang) => (
          <option key={lang.value} value={lang.value}>
            {lang.label === "other" ? t("dictionary.other") : t(`translator.${lang.label}`)}
          </option>
        ))}
      </Select>
      {showCustomInput && (
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => handleCustomInputChange(e.target.value)}
          placeholder={t("deck_id.enterLanguageName")}
          variant="bordered"
        />
      )}
    </VStack>
  );
}
