/**
 * LocaleSelector - 语言选择器组件
 *
 * 使用 Design System 重写的语言选择器组件
 */
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Input } from "@/design-system/base/input";
import { Select } from "@/design-system/base/select";
import { VStack } from "@/design-system/layout/stack";

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
      <Select
        value={isCommonLanguage ? value : "other"}
        onChange={handleSelectChange}
      >
        {COMMON_LANGUAGES.map((lang) => (
          <option key={lang.value} value={lang.value}>
            {t(`translator.${lang.label}`)}
          </option>
        ))}
      </Select>
      {showCustomInput && (
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => handleCustomInputChange(e.target.value)}
          placeholder={t("folder_id.enterLanguageName")}
          variant="bordered"
        />
      )}
    </VStack>
  );
}
