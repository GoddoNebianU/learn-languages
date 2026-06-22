"use client";

import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CardItem } from "./CardItem";
import { useTranslations } from "next-intl";
import { PageLayout } from "@/components/ui/PageLayout";
import { Button } from "@/design-system/button";
import { IconButton } from "@/design-system/icon-button";
import { LinkButton } from "@/design-system/link-button";
import { CardList } from "@/components/ui/CardList";
import { VStack } from "@/design-system/stack";
import { Skeleton } from "@/design-system/skeleton";
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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { actionGetCardsByDeckId, actionDeleteCard, actionReorderCards } from "@/modules/card/card-action";
import { actionGetDeckById, actionDeleteDeck } from "@/modules/deck/deck-action";
import type { ActionOutputCard } from "@/modules/card/card-action-dto";
import type { ActionOutputDeck } from "@/modules/deck/deck-action-dto";
import { toast } from "sonner";
import { AddCardModal } from "./AddCardModal";
import { useBatchedCards } from "@/hooks/useBatchedCards";

interface SortableCardItemProps {
  card: ActionOutputCard;
  isReadOnly: boolean;
  onDel: () => void;
  onUpdated: () => void;
}

function SortableCardItem({ card, isReadOnly, onDel, onUpdated }: SortableCardItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <CardItem
        card={card}
        isReadOnly={isReadOnly}
        onDel={onDel}
        onUpdated={onUpdated}
        dragHandleProps={isReadOnly ? undefined : { attributes, listeners, ref: undefined }}
      />
    </div>
  );
}

export function InDeck({ deckId, isReadOnly }: { deckId: number; isReadOnly: boolean }) {
  const {
    cards: batchedCards,
    total,
    loaded,
    isLoading,
    error: cardsError,
    progress,
  } = useBatchedCards(deckId, true);
  const [cards, setCards] = useState<ActionOutputCard[]>([]);
  const [openAddModal, setAddModal] = useState(false);
  const [showDeleteDeckConfirm, setShowDeleteDeckConfirm] = useState(false);
  const [deckInfo, setDeckInfo] = useState<ActionOutputDeck | null>(null);
  const router = useRouter();
  const t = useTranslations("deck_id");

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

  useEffect(() => {
    let ignore = false;
    const fetchDeckInfo = async () => {
      const deckResult = await actionGetDeckById({ deckId });
      if (!ignore && deckResult.success && deckResult.data) {
        setDeckInfo(deckResult.data);
      }
    };
    fetchDeckInfo();
    return () => {
      ignore = true;
    };
  }, [deckId]);

  useEffect(() => {
    if (!isLoading) {
      setCards(batchedCards);
    }
  }, [isLoading, batchedCards]);

  useEffect(() => {
    if (cardsError) {
      toast.error(cardsError);
    }
  }, [cardsError]);

  const handleDragEnd = async (event: DragEndEvent) => {
    if (isReadOnly) return;

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = cards.findIndex((c) => c.id === active.id);
    const newIndex = cards.findIndex((c) => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    // Optimistic update
    const newCards = [...cards];
    const [moved] = newCards.splice(oldIndex, 1);
    newCards.splice(newIndex, 0, moved);
    setCards(newCards);

    // Persist new order
    const result = await actionReorderCards({
      deckId,
      cardIds: newCards.map((c) => c.id),
    });
    if (!result.success) {
      toast.error(result.message);
      refreshCards(); // Revert on failure
    }
  };

  const refreshCards = async () => {
    const result = await actionGetCardsByDeckId({ deckId });
    if (result.success && result.data) {
      setCards(result.data);
    } else {
      toast.error(result.message);
    }
  };

  const handleDeleteCard = async (cardId: number) => {
    try {
      const result = await actionDeleteCard({ cardId });
      if (result.success) {
        toast.success(t("cardDeleted"));
        await refreshCards();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unknown error");
    }
  };

  const handleDeleteDeck = async () => {
    try {
      const result = await actionDeleteDeck({ deckId });
      if (result.success) {
        toast.success(result.message);
        router.push("/decks");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unknown error");
    }
    setShowDeleteDeckConfirm(false);
  };

  return (
    <PageLayout>
      <div className="mb-6">
        <LinkButton onClick={router.back} className="mb-4 flex items-center gap-2">
          <ArrowLeft size={16} />
          <span className="text-sm">{t("back")}</span>
        </LinkButton>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-1 text-2xl font-bold text-gray-800 md:text-3xl">
              {deckInfo?.name || t("cards")}
            </h1>
            <p className="text-sm text-gray-500">{t("itemsCount", { count: cards.length })}</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              onClick={() => {
                router.push(`/memorize?deck_id=${deckId}`);
              }}
            >
              {t("memorize")}
            </Button>
            {!isReadOnly && (
              <>
                <IconButton className="rounded-full" onClick={() => setAddModal(true)}>
                  <Plus size={18} className="text-gray-700" />
                </IconButton>
                <IconButton
                  className="rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500"
                  onClick={() => setShowDeleteDeckConfirm(true)}
                >
                  <Trash2 size={18} />
                </IconButton>
              </>
            )}
          </div>
        </div>
      </div>

      <CardList>
        {isLoading ? (
          <VStack align="center" gap={4} className="p-8">
            <Skeleton variant="circular" className="h-8 w-8" />
            <p className="text-sm text-gray-600">
              {t("loadingProgress", { loaded, total })}
            </p>
            <div className="h-2 w-64 overflow-hidden rounded-full bg-primary-200">
              <div
                className="h-full rounded-full bg-primary-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </VStack>
        ) : cards.length === 0 ? (
          <div className="p-12 text-center">
            <p className="mb-2 text-sm text-gray-500">{t("noCards")}</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={cards.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              {cards.map((card) => (
                <SortableCardItem
                  key={card.id}
                  card={card}
                  isReadOnly={isReadOnly}
                  onDel={() => handleDeleteCard(card.id)}
                  onUpdated={refreshCards}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </CardList>

      <AddCardModal
        isOpen={openAddModal}
        onClose={() => setAddModal(false)}
        deckId={deckId}
        onAdded={refreshCards}
      />

      {showDeleteDeckConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 max-w-sm rounded-lg bg-white p-4">
            <p className="mb-4 text-gray-700">{t("deleteDeckConfirm")}</p>
            <div className="flex justify-end gap-2">
              <Button variant="light" size="sm" onClick={() => setShowDeleteDeckConfirm(false)}>
                {t("cancel")}
              </Button>
              <Button variant="light" size="sm" onClick={handleDeleteDeck}>
                {t("delete")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
