"use client";

import { useState } from "react";
import { Button } from "@/design-system/button";
import { Input } from "@/design-system/input";
import { POPULAR_LANGUAGES } from "@/shared/languages";

interface LanguageSelectorProps {
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
  otherLabel: string;
  otherPlaceholder: string;
}

export function LanguageSelector({
  label,
  hint,
  value,
  onChange,
  otherLabel,
  otherPlaceholder,
}: LanguageSelectorProps) {
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
      <label className="mb-2 block text-sm text-gray-700">
        {label} ({hint})
      </label>
      <div className="mb-2 flex flex-wrap gap-2">
        {POPULAR_LANGUAGES.map((lang) => (
          <Button
            variant="light"
            key={lang.code}
            type="button"
            selected={isPresetLanguage && value === lang.code}
            onClick={() => handlePresetSelect(lang.code)}
            className="px-3 text-sm"
          >
            {lang.nativeName}
          </Button>
        ))}
        <Button
          variant="light"
          type="button"
          selected={!isPresetLanguage && !!value}
          onClick={handleCustomToggle}
          className="px-3 py-1 text-sm"
        >
          {otherLabel}
        </Button>
      </div>
      {(showCustomInput || (!isPresetLanguage && value)) && (
        <Input
          type="text"
          value={isPresetLanguage ? customLang : value}
          onChange={(e) => handleCustomChange(e.target.value)}
          placeholder={otherPlaceholder}
          className="text-sm"
        />
      )}
    </div>
  );
}
