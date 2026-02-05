import { useTranslations } from "next-intl";
import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Select, Option } from "@/components/ui/Select";

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
];

interface LocaleSelectorProps {
  value: string;
  onChange: (val: string) => void;
}

export function LocaleSelector({ value, onChange }: LocaleSelectorProps) {
  const t = useTranslations();
  const [customInput, setCustomInput] = useState("");
  const isCommonLanguage = COMMON_LANGUAGES.some((l) => l.value === value && l.value !== "other");
  const showCustomInput = value === "other" || !isCommonLanguage;

  // 计算输入框的值:如果是"other"使用自定义输入,否则使用外部传入的值
  const inputValue = value === "other" ? customInput : value;

  // 处理自定义输入
  const handleCustomInputChange = (inputValue: string) => {
    setCustomInput(inputValue);
    onChange(inputValue);
  };

  // 当选择常见语言或"其他"时
  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue === "other") {
      setCustomInput("");
      onChange("other");
    } else {
      onChange(selectedValue);
    }
  };

  return (
    <div>
      <Select
        value={isCommonLanguage ? value : "other"}
        onChange={handleSelectChange}
      >
        {COMMON_LANGUAGES.map((lang) => (
          <Option key={lang.value} value={lang.value}>
            {t(`translator.${lang.label}`)}
          </Option>
        ))}
      </Select>
      {showCustomInput && (
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => handleCustomInputChange(e.target.value)}
          placeholder={t("folder_id.enterLanguageName")}
          variant="bordered"
          className="mt-2"
        />
      )}
    </div>
  );
}
