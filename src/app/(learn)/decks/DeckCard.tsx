"use client";

import { ChevronRight, GripVertical, Globe, Layers, Lock, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/design-system/button";
import { IconButton } from "@/design-system/icon-button";
import { Modal } from "@/design-system/modal";
import { Input } from "@/design-system/input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { actionDeleteDeck, actionUpdateDeck } from "@/modules/deck/deck-action";
import type { ActionOutputDeck } from "@/modules/deck/deck-action-dto";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableDeckCardProps {
  deck: ActionOutputDeck;
  onUpdateDeck: (deckId: number, updates: Partial<ActionOutputDeck>) => void;
  onDeleteDeck: (deckId: number) => void;
}

export function SortableDeckCard({ deck, onUpdateDeck, onDeleteDeck }: SortableDeckCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deck.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div className="flex items-center">
        <div
          className="cursor-grab px-2 text-gray-300 hover:text-gray-500 active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={18} />
        </div>
        <div className="flex-1">
          <DeckCard deck={deck} onUpdateDeck={onUpdateDeck} onDeleteDeck={onDeleteDeck} />
        </div>
      </div>
    </div>
  );
}

interface DeckCardProps {
  deck: ActionOutputDeck;
  onUpdateDeck: (deckId: number, updates: Partial<ActionOutputDeck>) => void;
  onDeleteDeck: (deckId: number) => void;
}

const DeckCard = ({ deck, onUpdateDeck, onDeleteDeck }: DeckCardProps) => {
  const router = useRouter();
  const t = useTranslations("decks");
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmValue, setDeleteConfirmValue] = useState("");

  const handleToggleVisibility = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newVisibility = deck.visibility === "PUBLIC" ? "PRIVATE" : "PUBLIC";
    const result = await actionUpdateDeck({
      deckId: deck.id,
      visibility: newVisibility,
    });
    if (result.success) {
      onUpdateDeck(deck.id, { visibility: newVisibility });
    } else {
      toast.error(result.message);
    }
  };

const handleRename = async (e: React.MouseEvent) => {
  e.stopPropagation();
  setShowRenameModal(true);
};

const handleRenameConfirm = async () => {
  if (renameValue && renameValue.trim().length > 0) {
    const result = await actionUpdateDeck({
      deckId: deck.id,
      name: renameValue.trim(),
    });
    if (result.success) {
      onUpdateDeck(deck.id, { name: renameValue.trim() });
    } else {
      toast.error(result.message);
    }
  }
  setShowRenameModal(false);
  setRenameValue("");
};

const handleDelete = async (e: React.MouseEvent) => {
  e.stopPropagation();
  setShowDeleteModal(true);
};

const handleDeleteConfirm = async () => {
  if (deleteConfirmValue === deck.name) {
    const result = await actionDeleteDeck({ deckId: deck.id });
    if (result.success) {
      onDeleteDeck(deck.id);
    } else {
      toast.error(result.message);
    }
  }
  setShowDeleteModal(false);
  setDeleteConfirmValue("");
};

  return (
    <>
      <div
        className="group flex cursor-pointer flex-col gap-2 border-b border-gray-200 px-5 py-4 transition-colors last:border-b-0 hover:bg-gray-50"
        onClick={() => {
          router.push(`/decks/${deck.id}`);
        }}
      >
        <div className="flex items-center gap-4">
          <div className="shrink-0 text-primary-500">
            <Layers size={24} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="min-w-0 overflow-x-auto whitespace-nowrap font-semibold text-gray-900">{deck.name}</h3>
              <span className="flex shrink-0 items-center gap-1 text-xs text-gray-400">
                {deck.visibility === "PUBLIC" ? <Globe size={12} /> : <Lock size={12} />}
                {deck.visibility === "PUBLIC" ? t("public") : t("private")}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-gray-500">
              {t("deckInfo", {
                id: deck.id,
                name: deck.name,
                totalCards: deck.cardCount ?? 0,
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-1">
          <IconButton
            className="rounded-full"
            onClick={handleToggleVisibility}
            title={deck.visibility === "PUBLIC" ? t("setPrivate") : t("setPublic")}
          >
            {deck.visibility === "PUBLIC" ? <Lock size={18} /> : <Globe size={18} />}
          </IconButton>
          <IconButton className="rounded-full" onClick={handleRename}>
            <Pencil size={18} />
          </IconButton>
          <IconButton
            onClick={handleDelete}
            className="rounded-full hover:bg-red-50 hover:text-red-500"
          >
            <Trash2 size={18} />
          </IconButton>
          <ChevronRight size={20} className="text-gray-400" />
        </div>
      </div>

      <Modal open={showRenameModal} onClose={() => setShowRenameModal(false)}>
        <div className="p-6">
          <h2 className="mb-4 text-xl font-bold">{t("renameDeck")}</h2>

          <div className="space-y-4">
            <p className="text-gray-700">{t("rename")}</p>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {t("newName")}
              </label>
              <Input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                variant="bordered"
                placeholder={deck.name}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="light" onClick={() => setShowRenameModal(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleRenameConfirm}>
              {t("rename")}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <div className="p-6">
          <h2 className="mb-4 text-xl font-bold text-red-600">{t("deleteDeck")}</h2>

          <div className="space-y-4">
            <p className="text-gray-700">{t("confirmDelete", { name: deck.name })}</p>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {t("deleteDeck")}
              </label>
              <Input
                type="text"
                value={deleteConfirmValue}
                onChange={(e) => setDeleteConfirmValue(e.target.value)}
                variant="bordered"
                placeholder={deck.name}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="light" onClick={() => setShowDeleteModal(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleDeleteConfirm}>
              {t("deleteDeck")}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
