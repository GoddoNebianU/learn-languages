import { LOCALES } from "@/config/locales";

const COMMON_LOCALES = [
  { label: "中文", value: "zh-CN" },
  { label: "英文", value: "en-US" },
  { label: "意大利语", value: "it-IT" },
  { label: "日语", value: "ja-JP" },
  { label: "其他", value: "other" },
];

interface LocaleSelectorProps {
  value: string;
  onChange: (val: string) => void;
}

export function LocaleSelector({ value, onChange }: LocaleSelectorProps) {
  const isCommonLocale = COMMON_LOCALES.some((l) => l.value === value && l.value !== "other");
  const showFullList = value === "other" || !isCommonLocale;

  return (
    <div>
      <select
        value={isCommonLocale ? value : "other"}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#35786f]"
      >
        {COMMON_LOCALES.map((locale) => (
          <option key={locale.value} value={locale.value}>
            {locale.label}
          </option>
        ))}
      </select>
      {showFullList && (
        <select
          value={value === "other" ? LOCALES[0] : value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#35786f] mt-2"
        >
          {LOCALES.map((locale) => (
            <option key={locale} value={locale}>
              {locale}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
