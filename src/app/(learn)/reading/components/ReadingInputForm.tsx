"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/design-system/button";
import { Textarea } from "@/design-system/textarea";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { Loader2, Languages } from "lucide-react";

interface ReadingInputFormProps {
  targetLanguage: string;
  onTargetLanguageChange: (lang: string) => void;
  processing: boolean;
  progress: { current: number; total: number };
  onTranslate: () => void;
  onCancel: () => void;
}

export function ReadingInputForm({
  targetLanguage,
  onTargetLanguageChange,
  processing,
  progress,
  onTranslate,
  onCancel,
}: ReadingInputFormProps) {
  const t = useTranslations("reading");

  return (
    <>
      <div>
        <Textarea
          id="reading-input"
          className="min-h-48 w-full resize-y"
          placeholder={t("inputPlaceholder")}
          onKeyDown={(e) => {
            if (e.ctrlKey && e.key === "Enter" && !processing) onTranslate();
          }}
        />
      </div>

      <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
        <LanguageSelector
          value={targetLanguage}
          onChange={onTargetLanguageChange}
          label={t("targetLanguage")}
          hint={t("targetLanguageHint")}
          otherPlaceholder={t("customLanguage")}
        />

        <div className="shrink-0 pb-2">
          {processing ? (
            <Button variant="light" size="lg" onClick={onCancel} className="text-xl">
              <Loader2 size={20} className="animate-spin" />
              {t("processingParagraph", progress)}
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              onClick={onTranslate}
              className="text-xl"
            >
              <Languages size={20} />
              {t("translate")}
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
