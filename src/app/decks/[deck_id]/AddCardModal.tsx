"use client";

import { LightButton } from "@/design-system/base/button";
import { Input } from "@/design-system/base/input";
import { X } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { actionCreateNote } from "@/modules/note/note-action";
import { actionCreateCard } from "@/modules/card/card-action";
import { actionGetNoteTypesByUserId, actionCreateDefaultBasicNoteType } from "@/modules/note-type/note-type-action";
import { toast } from "sonner";

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
  const wordRef = useRef<HTMLInputElement>(null);
  const definitionRef = useRef<HTMLInputElement>(null);
  const ipaRef = useRef<HTMLInputElement>(null);
  const exampleRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAdd = async () => {
    const word = wordRef.current?.value?.trim();
    const definition = definitionRef.current?.value?.trim();

    if (!word || !definition) {
      toast.error(t("wordAndDefinitionRequired"));
      return;
    }

    setIsSubmitting(true);

    try {
      let noteTypesResult = await actionGetNoteTypesByUserId();

      if (!noteTypesResult.success || !noteTypesResult.data || noteTypesResult.data.length === 0) {
        const createResult = await actionCreateDefaultBasicNoteType();
        if (!createResult.success || !createResult.data) {
          throw new Error(createResult.message || "Failed to create note type");
        }
        noteTypesResult = await actionGetNoteTypesByUserId();
      }

      if (!noteTypesResult.success || !noteTypesResult.data || noteTypesResult.data.length === 0) {
        throw new Error("No note type available");
      }

      const noteTypeId = noteTypesResult.data[0].id;

      const fields = [
        word,
        definition,
        ipaRef.current?.value?.trim() || "",
        exampleRef.current?.value?.trim() || "",
      ];

      const noteResult = await actionCreateNote({
        noteTypeId,
        fields,
        tags: [],
      });

      if (!noteResult.success || !noteResult.data) {
        throw new Error(noteResult.message || "Failed to create note");
      }

      const cardResult = await actionCreateCard({
        noteId: BigInt(noteResult.data.id),
        deckId,
      });

      if (!cardResult.success) {
        throw new Error(cardResult.message || "Failed to create card");
      }

      if (wordRef.current) wordRef.current.value = "";
      if (definitionRef.current) definitionRef.current.value = "";
      if (ipaRef.current) ipaRef.current.value = "";
      if (exampleRef.current) exampleRef.current.value = "";

      onAdded();
      onClose();
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
          handleAdd();
        }
      }}
    >
      <div className="bg-white rounded-md p-6 w-full max-w-md mx-4">
        <div className="flex">
          <h2 className="flex-1 text-xl font-light mb-4 text-center">
            {t("addNewCard")}
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
          <LightButton onClick={handleAdd} disabled={isSubmitting}>
            {isSubmitting ? t("adding") : t("add")}
          </LightButton>
        </div>
      </div>
    </div>
  );
}
