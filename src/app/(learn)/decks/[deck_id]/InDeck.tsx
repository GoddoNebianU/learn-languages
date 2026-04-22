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
import { actionGetCardsByDeckId, actionDeleteCard } from "@/modules/card/card-action";
import { actionGetDeckById, actionDeleteDeck } from "@/modules/deck/deck-action";
import type { ActionOutputCard } from "@/modules/card/card-action-dto";
import type { ActionOutputDeck } from "@/modules/deck/deck-action-dto";
import { toast } from "sonner";
import { AddCardModal } from "./AddCardModal";

export function InDeck({ deckId, isReadOnly }: { deckId: number; isReadOnly: boolean }) {
  const [cards, setCards] = useState<ActionOutputCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAddModal, setAddModal] = useState(false);
  const [showDeleteDeckConfirm, setShowDeleteDeckConfirm] = useState(false);
  const [deckInfo, setDeckInfo] = useState<ActionOutputDeck | null>(null);
  const router = useRouter();
  const t = useTranslations("deck_id");

  useEffect(() => {
    const fetchCards = async () => {
      setLoading(true);
      try {
        const [cardsResult, deckResult] = await Promise.all([
          actionGetCardsByDeckId({ deckId }),
          actionGetDeckById({ deckId }),
        ]);

        if (!cardsResult.success || !cardsResult.data) {
          throw new Error(cardsResult.message || "Failed to load cards");
        }
        setCards(cardsResult.data);

        if (deckResult.success && deckResult.data) {
          setDeckInfo(deckResult.data);
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, [deckId]);

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
                router.push(`/decks/${deckId}/learn`);
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
        {loading ? (
          <VStack align="center" className="p-8">
            <Skeleton variant="circular" className="h-8 w-8" />
            <p className="text-sm text-gray-500">{t("loadingCards")}</p>
          </VStack>
        ) : cards.length === 0 ? (
          <div className="p-12 text-center">
            <p className="mb-2 text-sm text-gray-500">{t("noCards")}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {cards.map((card) => (
              <CardItem
                key={card.id}
                card={card}
                isReadOnly={isReadOnly}
                onDel={() => handleDeleteCard(card.id)}
                onUpdated={refreshCards}
              />
            ))}
          </div>
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
