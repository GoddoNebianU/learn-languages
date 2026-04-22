"use client";

import { Button } from "@/design-system/base/button";
import { Input } from "@/design-system/base/input";
import { Textarea } from "@/design-system/base/textarea";
import { Modal } from "@/design-system/overlay/modal";
import { VStack, HStack } from "@/design-system/layout/stack";
import { Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { actionUpdateCard } from "@/modules/card/card-action";
import type { ActionOutputCard, CardMeaning } from "@/modules/card/card-action-dto";
import { toast } from "sonner";

interface EditCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: ActionOutputCard | null;
  onUpdated: () => void;
}

export function EditCardModal({
  isOpen,
  onClose,
  card,
  onUpdated,
}: EditCardModalProps) {
  const t = useTranslations("deck_id");
  
  const [word, setWord] = useState("");
  const [ipa, setIpa] = useState("");
  const [meanings, setMeanings] = useState<CardMeaning[]>([
    { partOfSpeech: null, definition: "", example: null }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showIpa = card?.cardType === "WORD" || card?.cardType === "PHRASE";

  useEffect(() => {
    if (card) {
      setWord(card.word);
      setIpa(card.ipa || "");
      setMeanings(
        card.meanings.length > 0 
          ? card.meanings 
          : [{ partOfSpeech: null, definition: "", example: null }]
      );
    }
  }, [card]);

  const addMeaning = () => {
    setMeanings([...meanings, { partOfSpeech: null, definition: "", example: null }]);
  };

  const removeMeaning = (index: number) => {
    if (meanings.length > 1) {
      setMeanings(meanings.filter((_, i) => i !== index));
    }
  };

  const updateMeaning = (index: number, field: keyof CardMeaning, value: string) => {
    const updated = [...meanings];
    updated[index] = { ...updated[index], [field]: value || null };
    setMeanings(updated);
  };

  const handleUpdate = async () => {
    if (!card) return;
    
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

    try {
      const result = await actionUpdateCard({
        cardId: card.id,
        word: word.trim(),
        ipa: showIpa && ipa.trim() ? ipa.trim() : null,
        meanings: validMeanings.map(m => ({
          partOfSpeech: card.cardType === "SENTENCE" ? null : (m.partOfSpeech?.trim() || null),
          definition: m.definition!.trim(),
          example: m.example?.trim() || null,
        })),
      });

      if (!result.success) {
        throw new Error(result.message || "Failed to update card");
      }

      onUpdated();
      onClose();
      toast.success(t("cardUpdated") || "Card updated successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!card) return null;

  const cardTypeLabel = card.cardType === "WORD" 
    ? t("wordCard") 
    : card.cardType === "PHRASE" 
      ? t("phraseCard") 
      : t("sentenceCard");

  return (
    <Modal open={isOpen} onClose={onClose} size="md">
      <Modal.Header>
        <Modal.Title>{t("updateCard")}</Modal.Title>
        <Modal.CloseButton onClick={onClose} />
      </Modal.Header>
      
      <Modal.Body className="space-y-4">
        <HStack gap={2} className="text-sm text-gray-500">
          <span className="px-2 py-1 bg-gray-100 rounded-md">
            {t("card")}
          </span>
          <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md">
            {cardTypeLabel}
          </span>
          <span className="px-2 py-1 bg-gray-100 rounded-md">
            {card.queryLang}
          </span>
        </HStack>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {card.cardType === "SENTENCE" ? t("sentence") : t("word")} *
          </label>
          <Input 
            value={word}
            onChange={(e) => setWord(e.target.value)}
            className="w-full" 
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
            <Button
              variant="link"
              onClick={addMeaning}
              className="text-sm text-blue-600 hover:text-blue-700"
              leftIcon={<Plus size={14} />}
            >
              {t("addMeaning")}
            </Button>
          </HStack>
          
          <VStack gap={4}>
            {meanings.map((meaning, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg space-y-2">
                <HStack gap={2}>
                  {card.cardType !== "SENTENCE" && (
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
                    <Button
                      variant="ghost"
                      onClick={() => removeMeaning(index)}
                      className="h-auto p-2 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </Button>
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
        <Button variant="secondary" onClick={onClose}>
          {t("cancel")}
        </Button>
        <Button variant="primary" onClick={handleUpdate} loading={isSubmitting}>
          {isSubmitting ? t("updating") : t("update")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
