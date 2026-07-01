"use client";

import { Layers, Plus } from "lucide-react";
import { Button } from "@/design-system/button";
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
  actionGetDecksByUserId,
  actionGetDeckById,
  actionReorderDecks,
} from "@/modules/deck/deck-action";
import type { ActionOutputDeck } from "@/modules/deck/deck-action-dto";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { SortableDeckCard } from "./DeckCard";

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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = decks.findIndex((d) => d.id === active.id);
    const newIndex = decks.findIndex((d) => d.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    // Optimistic update
    const newDecks = [...decks];
    const [moved] = newDecks.splice(oldIndex, 1);
    newDecks.splice(newIndex, 0, moved);
    setDecks(newDecks);

    // Persist new order
    const result = await actionReorderDecks({ deckIds: newDecks.map((d) => d.id) });
    if (!result.success) {
      toast.error(result.message);
      loadDecks(); // Revert on failure
    }
  };

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
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={decks.map((d) => d.id)}
                strategy={verticalListSortingStrategy}
              >
                {decks.map((deck) => (
                  <SortableDeckCard
                    key={deck.id}
                    deck={deck}
                    onUpdateDeck={handleUpdateDeck}
                    onDeleteDeck={handleDeleteDeck}
                  />
                ))}
              </SortableContext>
            </DndContext>
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
