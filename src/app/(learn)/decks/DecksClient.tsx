"use client";

import { ChevronRight, Layers, Pencil, Plus, Globe, Lock, Trash2 } from "lucide-react";
import { Button } from "@/design-system/button";
import { IconButton } from "@/design-system/icon-button";
import { Skeleton } from "@/design-system/skeleton";
import { VStack } from "@/design-system/stack";
import { Modal } from "@/design-system/modal";
import { Input } from "@/design-system/input";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { PageLayout } from "@/components/ui/PageLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { CardList } from "@/components/ui/CardList";
import {
  actionCreateDeck,
  actionDeleteDeck,
  actionGetDecksByUserId,
  actionUpdateDeck,
  actionGetDeckById,
} from "@/modules/deck/deck-action";
import type { ActionOutputDeck } from "@/modules/deck/deck-action-dto";

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
        className="group flex cursor-pointer items-center justify-between border-b border-gray-200 px-5 py-4 transition-colors last:border-b-0 hover:bg-gray-50"
        onClick={() => {
          router.push(`/decks/${deck.id}`);
        }}
      >
        <div className="flex flex-1 items-center gap-4">
          <div className="shrink-0 text-primary-500">
            <Layers size={24} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate font-semibold text-gray-900">{deck.name}</h3>
              <span className="flex items-center gap-1 text-xs text-gray-400">
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

        <div className="ml-4 flex items-center gap-1">
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

interface DecksClientProps {
  userId: string;
}

export function DecksClient({ userId }: DecksClientProps) {
  const t = useTranslations("decks");
  const router = useRouter();
  const [decks, setDecks] = useState<ActionOutputDeck[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDeckName, setNewDeckName] = useState("");

  const loadDecks = async () => {
    setLoading(true);
    const result = await actionGetDecksByUserId({ userId });
    if (result.success && result.data) {
      setDecks(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDecks();
  }, [userId]);

  const handleUpdateDeck = (deckId: number, updates: Partial<ActionOutputDeck>) => {
    setDecks((prev) => prev.map((d) => (d.id === deckId ? { ...d, ...updates } : d)));
  };

  const handleDeleteDeck = (deckId: number) => {
    setDecks((prev) => prev.filter((d) => d.id !== deckId));
  };

const handleCreateDeck = async () => {
  setShowCreateModal(true);
};

const handleCreateDeckConfirm = async () => {
  if (!newDeckName?.trim()) return;

  const result = await actionCreateDeck({ name: newDeckName.trim() });
  if (result.success && result.deckId) {
    const deckResult = await actionGetDeckById({ deckId: result.deckId });
    if (deckResult.success && deckResult.data) {
      setDecks((prev) => [...prev, deckResult.data!]);
    }
  } else {
    toast.error(result.message);
  }
  setShowCreateModal(false);
  setNewDeckName("");
};

  return (
    <>
      <PageLayout>
        <PageHeader title={t("title")} subtitle={t("subtitle")} />

        <div className="mb-4 flex gap-2">
          <Button variant="light" onClick={handleCreateDeck}>
            <Plus size={18} />
            {t("newDeck")}
          </Button>
        </div>

        <CardList>
          {loading ? (
            <VStack align="center" className="p-8">
              <Skeleton variant="circular" className="mb-3 h-8 w-8" />
              <p className="text-sm text-gray-500">{t("loading")}</p>
            </VStack>
          ) : decks.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <Layers size={24} className="text-gray-400" />
              </div>
              <p className="text-sm">{t("noDecksYet")}</p>
            </div>
          ) : (
            decks.map((deck) => (
              <DeckCard
                key={deck.id}
                deck={deck}
                onUpdateDeck={handleUpdateDeck}
                onDeleteDeck={handleDeleteDeck}
              />
            ))
          )}
        </CardList>
      </PageLayout>

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <div className="p-6">
          <h2 className="mb-4 text-xl font-bold">{t("createDeck")}</h2>

          <div className="space-y-4">
            <p className="text-gray-700">{t("create")}</p>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {t("enterDeckName")}
              </label>
              <Input
                type="text"
                value={newDeckName}
                onChange={(e) => setNewDeckName(e.target.value)}
                variant="bordered"
                placeholder={t("enterDeckName")}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="light" onClick={() => setShowCreateModal(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleCreateDeckConfirm}>
              {t("create")}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
