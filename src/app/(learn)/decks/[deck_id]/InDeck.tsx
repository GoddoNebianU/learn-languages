"use client";

import { ArrowLeft, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CardItem } from "./CardItem";
import { useTranslations } from "next-intl";
import { PageLayout } from "@/components/ui/PageLayout";
import { Button, CircleButton } from "@/design-system/button";
import { CardList } from "@/components/ui/CardList";
import { VStack } from "@/design-system/stack";
import { Skeleton } from "@/design-system/skeleton";
import { actionGetCardsByDeckId, actionDeleteCard } from "@/modules/card/card-action";
import { actionGetDeckById } from "@/modules/deck/deck-action";
import type { ActionOutputCard } from "@/modules/card/card-action-dto";
import type { ActionOutputDeck } from "@/modules/deck/deck-action-dto";
import { toast } from "sonner";
import { AddCardModal } from "./AddCardModal";

export function InDeck({ deckId, isReadOnly }: { deckId: number; isReadOnly: boolean }) {
  const [cards, setCards] = useState<ActionOutputCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAddModal, setAddModal] = useState(false);
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

  return (
    <PageLayout>
      <div className="mb-6">
        <Button
          variant="link"
          onClick={router.back}
          className="flex items-center gap-2 mb-4"
        >
          <ArrowLeft size={16} />
          <span className="text-sm">{t("back")}</span>
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">
              {deckInfo?.name || t("cards")}
            </h1>
            <p className="text-sm text-gray-500">
              {t("itemsCount", { count: cards.length })}
            </p>
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
              <CircleButton
                onClick={() => {
                  setAddModal(true);
                }}
              >
                <Plus size={18} className="text-gray-700" />
              </CircleButton>
            )}
          </div>
        </div>
      </div>

      <CardList>
        {loading ? (
          <VStack align="center" className="p-8">
            <Skeleton variant="circular" className="w-8 h-8" />
            <p className="text-sm text-gray-500">{t("loadingCards")}</p>
          </VStack>
        ) : cards.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-gray-500 mb-2">{t("noCards")}</p>
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
    </PageLayout>
  );
}
