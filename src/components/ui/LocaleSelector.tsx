import { useState } from "react";

const COMMON_LANGUAGES = [
  { label: "中文", value: "chinese" },
  { label: "英文", value: "english" },
  { label: "意大利语", value: "italian" },
  { label: "日语", value: "japanese" },
  { label: "韩语", value: "korean" },
  { label: "法语", value: "french" },
  { label: "德语", value: "german" },
  { label: "西班牙语", value: "spanish" },
  { label: "葡萄牙语", value: "portuguese" },
  { label: "俄语", value: "russian" },
  { label: "其他", value: "other" },
];

interface LocaleSelectorProps {
  value: string;
  onChange: (val: string) => void;
}

export function LocaleSelector({ value, onChange }: LocaleSelectorProps) {
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
      <select
        value={isCommonLanguage ? value : "other"}
        onChange={(e) => handleSelectChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#35786f]"
      >
        {COMMON_LANGUAGES.map((lang) => (
          <option key={lang.value} value={lang.value}>
            {lang.label}
          </option>
        ))}
      </select>
      {showCustomInput && (
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleCustomInputChange(e.target.value)}
          placeholder="请输入语言名称"
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#35786f] mt-2"
        />
      )}
    </div>
  );
}
