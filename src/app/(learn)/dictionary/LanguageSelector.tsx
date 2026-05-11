"use client";

import { useTranslations } from "next-intl";
import { LanguageSelector as SharedLanguageSelector } from "@/components/ui/LanguageSelector";

export { POPULAR_LANGUAGES } from "@/shared/languages";

interface LanguageSelectorProps {
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
}

export function LanguageSelector({ label, hint, value, onChange }: LanguageSelectorProps) {
  const t = useTranslations("dictionary");

  return (
    <SharedLanguageSelector
      label={label}
      hint={hint}
      value={value}
      onChange={onChange}
      otherPlaceholder={t("otherLanguagePlaceholder")}
    />
  );
}
