"use client";

import { LightButton, PrimaryButton } from "@/design-system/base/button";
import { Input } from "@/design-system/base/input";
import { Select } from "@/design-system/base/select";
import { Textarea } from "@/design-system/base/textarea";
import { Modal } from "@/design-system/overlay/modal";
import { VStack, HStack } from "@/design-system/layout/stack";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { actionCreateCard } from "@/modules/card/card-action";
import type { CardType, CardMeaning } from "@/modules/card/card-action-dto";
import { toast } from "sonner";

const QUERY_LANGUAGE_LABELS = {
  english: "english",
  chinese: "chinese",
  japanese: "japanese",
  korean: "korean",
} as const;

const QUERY_LANGUAGES = [
  { value: "en", label: "english" as const },
  { value: "zh", label: "chinese" as const },
  { value: "ja", label: "japanese" as const },
  { value: "ko", label: "korean" as const },
] as const;

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  deckId: number;
  onAdded: () => void;
}

export function AddCardModal({
  isOpen,
  onClose,
  deckId,
  onAdded,
}: AddCardModalProps) {
  const t = useTranslations("deck_id");
  
  const [cardType, setCardType] = useState<CardType>("WORD");
  const [word, setWord] = useState("");
  const [ipa, setIpa] = useState("");
  const [queryLang, setQueryLang] = useState("en");
  const [customQueryLang, setCustomQueryLang] = useState("");
  const [meanings, setMeanings] = useState<CardMeaning[]>([
    { partOfSpeech: null, definition: "", example: null }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showIpa = cardType === "WORD" || cardType === "PHRASE";

  const addMeaning = () => {
    setMeanings([...meanings, { partOfSpeech: null, definition: "", example: null }]);
  };

  const removeMeaning = (index: number) => {
    if (meanings.length > 1) {
      setMeanings(meanings.filter((_, i) => i !== index));
    }
  };

  const updateMeaning = (
    index: number, 
    field: "partOfSpeech" | "definition" | "example", 
    value: string
  ) => {
    const updated = [...meanings];
    updated[index] = { 
      ...updated[index], 
      [field]: value || null 
    };
    setMeanings(updated);
  };

  const resetForm = () => {
    setCardType("WORD");
    setWord("");
    setIpa("");
    setQueryLang("en");
    setCustomQueryLang("");
    setMeanings([{ partOfSpeech: null, definition: "", example: null }]);
  };

  const handleAdd = async () => {
    if (!word.trim()) {
      toast.error(t("wordRequired"));
      return;
    }

    const validMeanings = meanings.filter(m => m.definition?.trim());
    if (validMeanings.length === 0) {
      toast.error(t("definitionRequired"));
      return;
    }

    setIsSubmitting(true);

    const effectiveQueryLang = customQueryLang.trim() || queryLang;

    try {
      const cardResult = await actionCreateCard({
        deckId,
        word: word.trim(),
        ipa: showIpa && ipa.trim() ? ipa.trim() : null,
        queryLang: effectiveQueryLang,
        cardType,
        meanings: validMeanings.map(m => ({
          partOfSpeech: cardType === "SENTENCE" ? null : (m.partOfSpeech?.trim() || null),
          definition: m.definition!.trim(),
          example: m.example?.trim() || null,
        })),
      });

      if (!cardResult.success) {
        throw new Error(cardResult.message || "Failed to create card");
      }

      resetForm();
      onAdded();
      onClose();
      toast.success(t("cardAdded") || "Card added successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal open={isOpen} onClose={handleClose} size="md">
      <Modal.Header>
        <Modal.Title>{t("addNewCard")}</Modal.Title>
        <Modal.CloseButton onClick={handleClose} />
      </Modal.Header>
      
      <Modal.Body className="space-y-4">
        <HStack gap={3}>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("cardType")}
            </label>
            <Select 
              value={cardType} 
              onChange={(e) => setCardType(e.target.value as CardType)}
              className="w-full"
            >
              <option value="WORD">{t("wordCard")}</option>
              <option value="PHRASE">{t("phraseCard")}</option>
              <option value="SENTENCE">{t("sentenceCard")}</option>
            </Select>
          </div>
        </HStack>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("queryLang")}
          </label>
          <HStack gap={2} className="flex-wrap">
            {QUERY_LANGUAGES.map((lang) => (
              <LightButton
                key={lang.value}
                selected={!customQueryLang && queryLang === lang.value}
                onClick={() => {
                  setQueryLang(lang.value);
                  setCustomQueryLang("");
                }}
                size="sm"
              >
                {t(lang.label)}
              </LightButton>
            ))}
            <Input
              value={customQueryLang}
              onChange={(e) => setCustomQueryLang(e.target.value)}
              placeholder={t("enterLanguageName")}
              className="w-auto min-w-[100px] flex-1"
              size="sm"
            />
          </HStack>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {cardType === "SENTENCE" ? t("sentence") : t("word")} *
          </label>
          <Input 
            value={word}
            onChange={(e) => setWord(e.target.value)}
            className="w-full" 
            placeholder={cardType === "SENTENCE" ? t("sentencePlaceholder") : t("wordPlaceholder")}
          />
        </div>

        {showIpa && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("ipa")}
            </label>
            <Input 
              value={ipa}
              onChange={(e) => setIpa(e.target.value)}
              className="w-full" 
              placeholder={t("ipaPlaceholder")}
            />
          </div>
        )}

        <div>
          <HStack justify="between" className="mb-2">
            <label className="block text-sm font-medium text-gray-700">
              {t("meanings")} *
            </label>
            <button
              onClick={addMeaning}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Plus size={14} />
              {t("addMeaning")}
            </button>
          </HStack>
          
          <VStack gap={4}>
            {meanings.map((meaning, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg space-y-2">
                <HStack gap={2}>
                  {cardType !== "SENTENCE" && (
                    <div className="w-28 shrink-0">
                      <Input
                        value={meaning.partOfSpeech || ""}
                        onChange={(e) => updateMeaning(index, "partOfSpeech", e.target.value)}
                        placeholder={t("partOfSpeech")}
                        className="w-full"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      value={meaning.definition || ""}
                      onChange={(e) => updateMeaning(index, "definition", e.target.value)}
                      placeholder={t("definition")}
                      className="w-full"
                    />
                  </div>
                  {meanings.length > 1 && (
                    <button
                      onClick={() => removeMeaning(index)}
                      className="p-2 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </HStack>
                <Textarea
                  value={meaning.example || ""}
                  onChange={(e) => updateMeaning(index, "example", e.target.value)}
                  placeholder={t("examplePlaceholder")}
                  className="w-full min-h-[40px] text-sm"
                />
              </div>
            ))}
          </VStack>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <LightButton onClick={handleClose}>
          {t("cancel")}
        </LightButton>
        <PrimaryButton onClick={handleAdd} loading={isSubmitting}>
          {isSubmitting ? t("adding") : t("add")}
        </PrimaryButton>
      </Modal.Footer>
    </Modal>
  );
}
