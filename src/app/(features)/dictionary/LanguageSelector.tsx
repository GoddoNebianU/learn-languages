"use client";

import { useState } from "react";
import { LightButton } from "@/design-system/base/button";
import { Input } from "@/design-system/base/input";
import { POPULAR_LANGUAGES } from "./constants";
import { useTranslations } from "next-intl";

interface LanguageSelectorProps {
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
}

export function LanguageSelector({ label, hint, value, onChange }: LanguageSelectorProps) {
  const t = useTranslations("dictionary");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customLang, setCustomLang] = useState("");

  const isPresetLanguage = POPULAR_LANGUAGES.some((lang) => lang.code === value);

  const handlePresetSelect = (code: string) => {
    onChange(code);
    setShowCustomInput(false);
    setCustomLang("");
  };

  const handleCustomToggle = () => {
    setShowCustomInput(!showCustomInput);
    if (!showCustomInput && customLang.trim()) {
      onChange(customLang.trim());
    }
  };

  const handleCustomChange = (newValue: string) => {
    setCustomLang(newValue);
    if (newValue.trim()) {
      onChange(newValue.trim());
    }
  };

  return (
    <div>
      <label className="block text-gray-700 text-sm mb-2">
        {label} ({hint})
      </label>
      <div className="flex flex-wrap gap-2 mb-2">
        {POPULAR_LANGUAGES.map((lang) => (
          <LightButton
            key={lang.code}
            type="button"
            selected={isPresetLanguage && value === lang.code}
            onClick={() => handlePresetSelect(lang.code)}
            className="text-sm px-3 py-1"
          >
            {lang.nativeName}
          </LightButton>
        ))}
        <LightButton
          type="button"
          selected={!isPresetLanguage && !!value}
          onClick={handleCustomToggle}
          className="text-sm px-3 py-1"
        >
          {t("other")}
        </LightButton>
      </div>
      {(showCustomInput || (!isPresetLanguage && value)) && (
        <Input
          type="text"
          value={isPresetLanguage ? customLang : value}
          onChange={(e) => handleCustomChange(e.target.value)}
          placeholder={t("otherLanguagePlaceholder")}
          className="text-sm"
        />
      )}
    </div>
  );
}
