"use client";

import { LightButton } from "@/design-system/base/button";
import { Input } from "@/design-system/base/input";
import { X } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { actionUpdateNote } from "@/modules/note/note-action";
import type { ActionOutputCardWithNote } from "@/modules/card/card-action-dto";
import { toast } from "sonner";

interface UpdateCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: ActionOutputCardWithNote;
  onUpdated: () => void;
}

export function UpdateCardModal({
  isOpen,
  onClose,
  card,
  onUpdated,
}: UpdateCardModalProps) {
  const t = useTranslations("deck_id");
  const wordRef = useRef<HTMLInputElement>(null);
  const definitionRef = useRef<HTMLInputElement>(null);
  const ipaRef = useRef<HTMLInputElement>(null);
  const exampleRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && card) {
      const fields = card.note.flds.split('\x1f');
      if (wordRef.current) wordRef.current.value = fields[0] || "";
      if (definitionRef.current) definitionRef.current.value = fields[1] || "";
      if (ipaRef.current) ipaRef.current.value = fields[2] || "";
      if (exampleRef.current) exampleRef.current.value = fields[3] || "";
    }
  }, [isOpen, card]);

  if (!isOpen) return null;

  const handleUpdate = async () => {
    const word = wordRef.current?.value?.trim();
    const definition = definitionRef.current?.value?.trim();

    if (!word || !definition) {
      toast.error(t("wordAndDefinitionRequired"));
      return;
    }

    setIsSubmitting(true);

    try {
      const fields = [
        word,
        definition,
        ipaRef.current?.value?.trim() || "",
        exampleRef.current?.value?.trim() || "",
      ];

      const result = await actionUpdateNote({
        noteId: BigInt(card.note.id),
        fields,
      });

      if (!result.success) {
        throw new Error(result.message || "Failed to update note");
      }

      toast.success(result.message);
      onUpdated();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center z-50"
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          handleUpdate();
        }
      }}
    >
      <div className="bg-white rounded-md p-6 w-full max-w-md mx-4">
        <div className="flex">
          <h2 className="flex-1 text-xl font-light mb-4 text-center">
            {t("updateCard")}
          </h2>
          <X onClick={onClose} className="hover:cursor-pointer"></X>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("word")} *
            </label>
            <Input ref={wordRef} className="w-full"></Input>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("definition")} *
            </label>
            <Input ref={definitionRef} className="w-full"></Input>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("ipa")}
            </label>
            <Input ref={ipaRef} className="w-full"></Input>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("example")}
            </label>
            <Input ref={exampleRef} className="w-full"></Input>
          </div>
        </div>
        <div className="mt-4">
          <LightButton onClick={handleUpdate} disabled={isSubmitting}>
            {isSubmitting ? t("updating") : t("update")}
          </LightButton>
        </div>
      </div>
    </div>
  );
}
