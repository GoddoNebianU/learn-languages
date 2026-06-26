"use client";

import { Button } from "@/design-system/button";
import { IconButton } from "@/design-system/icon-button";
import { LinkButton } from "@/design-system/link-button";
import { Input } from "@/design-system/input";
import { Field } from "@/design-system/field";
import { Textarea } from "@/design-system/textarea";
import { Modal } from "@/design-system/modal";
import { Badge } from "@/design-system/badge";
import { VStack, HStack } from "@/design-system/stack";
import { Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { actionUpdateCard } from "@/modules/card/card-action";
import type { ActionOutputCard, CardMeaning, CardExample } from "@/modules/card/card-action-dto";
import { toast } from "sonner";

type ExampleWithId = CardExample & { id: string };
type MeaningWithId = Omit<CardMeaning, "examples"> & { id: string; examples: ExampleWithId[] };

interface EditCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: ActionOutputCard | null;
  onUpdated: () => void;
}

export function EditCardModal({ isOpen, onClose, card, onUpdated }: EditCardModalProps) {
  const t = useTranslations("deck_id");

  const [word, setWord] = useState("");
  const [ipa, setIpa] = useState("");
  const [meanings, setMeanings] = useState<MeaningWithId[]>([
    { partOfSpeech: null, definition: "", examples: [], id: crypto.randomUUID() },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showIpa = card?.cardType === "WORD" || card?.cardType === "PHRASE";

  useEffect(() => {
    if (card) {
      setWord(card.word);
      setIpa(card.ipa || "");
      setMeanings(
        card.meanings.length > 0
          ? card.meanings.map((m) => ({
              ...m,
              id: crypto.randomUUID(),
              examples: m.examples.map((e) => ({ ...e, id: crypto.randomUUID() })),
            }))
          : [{ partOfSpeech: null, definition: "", examples: [], id: crypto.randomUUID() }]
      );
    }
  }, [card]);

  const addMeaning = () => {
    setMeanings([
      ...meanings,
      { partOfSpeech: null, definition: "", examples: [], id: crypto.randomUUID() },
    ]);
  };

  const removeMeaning = (index: number) => {
    if (meanings.length > 1) {
      setMeanings(meanings.filter((_, i) => i !== index));
    }
  };

  const updateMeaning = (index: number, field: "partOfSpeech" | "definition", value: string) => {
    const updated = [...meanings];
    updated[index] = { ...updated[index], [field]: value || null };
    setMeanings(updated);
  };

  const addExample = (meaningIndex: number) => {
    const updated = [...meanings];
    updated[meaningIndex] = {
      ...updated[meaningIndex],
      examples: [
        ...updated[meaningIndex].examples,
        { id: crypto.randomUUID(), example: "", translation: null },
      ],
    };
    setMeanings(updated);
  };

  const removeExample = (meaningIndex: number, exampleIndex: number) => {
    const updated = [...meanings];
    updated[meaningIndex] = {
      ...updated[meaningIndex],
      examples: updated[meaningIndex].examples.filter((_, i) => i !== exampleIndex),
    };
    setMeanings(updated);
  };

  const updateExample = (
    meaningIndex: number,
    exampleIndex: number,
    field: "example" | "translation",
    value: string
  ) => {
    const updated = [...meanings];
    const examples = [...updated[meaningIndex].examples];
    examples[exampleIndex] = {
      ...examples[exampleIndex],
      [field]: value || null,
    };
    updated[meaningIndex] = { ...updated[meaningIndex], examples };
    setMeanings(updated);
  };

  const handleUpdate = async () => {
    if (!card) return;

    if (!word.trim()) {
      toast.error(t("wordRequired"));
      return;
    }

    const validMeanings = meanings.filter((m) => m.definition?.trim());
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
        meanings: validMeanings.map((m) => ({
          partOfSpeech: card.cardType === "SENTENCE" ? null : m.partOfSpeech?.trim() || null,
          definition: m.definition!.trim(),
          examples:
            card.cardType === "SENTENCE"
              ? []
              : m.examples
                  .filter((e) => e.example.trim())
                  .map((e) => ({
                    example: e.example.trim(),
                    translation: e.translation?.trim() || null,
                  })),
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

  const cardTypeLabel =
    card.cardType === "WORD"
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
        <Badge>{t("card")}</Badge>
        <Badge variant="info">{cardTypeLabel}</Badge>
        <Badge>{card.queryLang}</Badge>
        </HStack>

        <Field label={card.cardType === "SENTENCE" ? t("sentence") : t("word")} required>
          <Input value={word} onChange={(e) => setWord(e.target.value)} className="w-full" />
        </Field>

        {showIpa && (
          <Field label={t("ipa")}>
            <Input
              value={ipa}
              onChange={(e) => setIpa(e.target.value)}
              className="w-full"
              placeholder={t("ipaPlaceholder")}
            />
          </Field>
        )}

        <div>
          <HStack justify="between" className="mb-2">
            <label className="block text-sm font-medium text-gray-700">{t("meanings")} *</label>
            <LinkButton onClick={addMeaning} className="text-sm text-blue-600 hover:text-blue-700">
              {t("addMeaning")}
            </LinkButton>
          </HStack>

          <VStack gap={4}>
            {meanings.map((meaning, index) => (
              <div key={meaning.id} className="space-y-2 rounded-lg bg-gray-50 p-3">
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
                    <IconButton
                      onClick={() => removeMeaning(index)}
                      className="h-auto p-2 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  )}
                </HStack>
                {card.cardType !== "SENTENCE" && (
                  <div className="space-y-2">
                    {meaning.examples.map((ex, exIdx) => (
                      <div key={ex.id} className="space-y-1.5 rounded-md bg-white p-2">
                        <HStack gap={2} align="start">
                          <div className="flex-1">
                            <Textarea
                              value={ex.example}
                              onChange={(e) => updateExample(index, exIdx, "example", e.target.value)}
                              placeholder={t("examplePlaceholder")}
                              className="min-h-[40px] w-full text-sm"
                            />
                          </div>
                          <IconButton
                            onClick={() => removeExample(index, exIdx)}
                            className="shrink-0 p-1 text-gray-400 hover:text-red-500"
                          >
                            <Trash2 size={14} />
                          </IconButton>
                        </HStack>
                        <Input
                          value={ex.translation || ""}
                          onChange={(e) => updateExample(index, exIdx, "translation", e.target.value)}
                          placeholder={t("translationPlaceholder")}
                          className="w-full text-sm"
                          size="sm"
                        />
                      </div>
                    ))}
                    <LinkButton
                      onClick={() => addExample(index)}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      {t("addExample")}
                    </LinkButton>
                  </div>
                )}
              </div>
            ))}
          </VStack>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="light" onClick={onClose}>
          {t("cancel")}
        </Button>
        <Button variant="primary" onClick={handleUpdate} loading={isSubmitting}>
          {isSubmitting ? t("updating") : t("update")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
