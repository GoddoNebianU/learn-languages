"use client";

import { ArrowLeft, Plus, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { redirect, useRouter } from "next/navigation";
import { AddCardModal } from "./AddCardModal";
import { CardItem } from "./CardItem";
import { useTranslations } from "next-intl";
import { PageLayout } from "@/components/ui/PageLayout";
import { PrimaryButton, CircleButton, LinkButton, LightButton } from "@/design-system/base/button";
import { CardList } from "@/components/ui/CardList";
import { Modal } from "@/design-system/overlay/modal";
import { actionGetCardsByDeckIdWithNotes, actionDeleteCard, actionResetDeckCards } from "@/modules/card/card-action";
import type { ActionOutputCardWithNote } from "@/modules/card/card-action-dto";
import { toast } from "sonner";


export function InDeck({ deckId, isReadOnly }: { deckId: number; isReadOnly: boolean; }) {
  const [cards, setCards] = useState<ActionOutputCardWithNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAddModal, setAddModal] = useState(false);
  const [openResetModal, setResetModal] = useState(false);
  const [resetting, setResetting] = useState(false);
  const router = useRouter();
  const t = useTranslations("deck_id");

  useEffect(() => {
    const fetchCards = async () => {
      setLoading(true);
      await actionGetCardsByDeckIdWithNotes({ deckId })
        .then(result => {
          if (!result.success || !result.data) {
            throw new Error(result.message || "Failed to load cards");
          }
          return result.data;
        }).then(setCards)
        .catch((error) => {
          toast.error(error instanceof Error ? error.message : "Unknown error");
        })
        .finally(() => {
          setLoading(false);
        });
    };
    fetchCards();
  }, [deckId]);

  const refreshCards = async () => {
    await actionGetCardsByDeckIdWithNotes({ deckId })
      .then(result => {
        if (!result.success || !result.data) {
          throw new Error(result.message || "Failed to refresh cards");
        }
        return result.data;
      }).then(setCards)
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : "Unknown error");
      });
  };

  const handleResetDeck = async () => {
    setResetting(true);
    try {
      const result = await actionResetDeckCards({ deckId });
      if (result.success) {
        toast.success(t("resetSuccess", { count: result.data?.count ?? 0 }));
        setResetModal(false);
        await refreshCards();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setResetting(false);
    }
  };

  return (
    <PageLayout>
      <div className="mb-6">
        <LinkButton
          onClick={router.back}
          className="flex items-center gap-2 mb-4"
        >
          <ArrowLeft size={16} />
          <span className="text-sm">{t("back")}</span>
        </LinkButton>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">
              {t("cards")}
            </h1>
            <p className="text-sm text-gray-500">
              {t("itemsCount", { count: cards.length })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <PrimaryButton
              onClick={() => {
                redirect(`/memorize?deck_id=${deckId}`);
              }}
            >
              {t("memorize")}
            </PrimaryButton>
            {!isReadOnly && (
              <>
                <LightButton
                  onClick={() => setResetModal(true)}
                  leftIcon={<RotateCcw size={16} />}
                >
                  {t("resetProgress")}
                </LightButton>
                <CircleButton
                  onClick={() => {
                    setAddModal(true);
                  }}
                >
                  <Plus size={18} className="text-gray-700" />
                </CircleButton>
              </>
            )}
          </div>
        </div>
      </div>

      <CardList>
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-gray-500">{t("loadingCards")}</p>
          </div>
        ) : cards.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-gray-500 mb-2">{t("noCards")}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {cards
              .toSorted((a, b) => Number(BigInt(a.id) - BigInt(b.id)))
              .map((card) => (
                <CardItem
                  key={card.id}
                  card={card}
                  isReadOnly={isReadOnly}
                  onDel={() => {
                    actionDeleteCard({ cardId: BigInt(card.id) })
                      .then(result => {
                        if (!result.success) throw new Error(result.message || "Delete failed");
                      }).then(refreshCards)
                      .catch((error) => {
                        toast.error(error instanceof Error ? error.message : "Unknown error");
                      });
                  }}
                  refreshCards={refreshCards}
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

      {/* Reset Progress Confirmation Modal */}
      <Modal open={openResetModal} onClose={() => setResetModal(false)} size="sm">
        <Modal.Header>
          <Modal.Title>{t("resetProgressTitle")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-gray-600">{t("resetProgressConfirm")}</p>
        </Modal.Body>
        <Modal.Footer>
          <LightButton onClick={() => setResetModal(false)}>
            {t("cancel")}
          </LightButton>
          <PrimaryButton onClick={handleResetDeck} loading={resetting}>
            {resetting ? t("resetting") : t("resetProgress")}
          </PrimaryButton>
        </Modal.Footer>
      </Modal>
    </PageLayout>
  );
};
