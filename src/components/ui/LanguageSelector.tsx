"use client";

import { Button } from "@/design-system/button";
import { Input } from "@/design-system/input";
import { POPULAR_LANGUAGES } from "@/shared/languages";

interface LanguageSelectorProps {
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
  otherPlaceholder: string;
}

export function LanguageSelector({
  label,
  hint,
  value,
  onChange,
  otherPlaceholder,
}: LanguageSelectorProps) {
  return (
    <div>
      <label className="mb-2 block text-sm text-gray-700">
        {label} ({hint})
      </label>
      <div className="flex flex-wrap items-center gap-2">
        {POPULAR_LANGUAGES.map((lang) => (
          <Button
            variant="light"
            key={lang.code}
            type="button"
            onClick={() => onChange(lang.nativeName)}
            className="px-3 text-sm"
          >
            {lang.nativeName}
          </Button>
        ))}
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={otherPlaceholder}
          className="w-32 text-sm"
        />
      </div>
    </div>
  );
}
