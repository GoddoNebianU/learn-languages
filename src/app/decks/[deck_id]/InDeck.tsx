"use client";

import { ArrowLeft, Plus, RotateCcw, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AddCardModal } from "./AddCardModal";
import { CardItem } from "./CardItem";
import { useTranslations } from "next-intl";
import { PageLayout } from "@/components/ui/PageLayout";
import { PrimaryButton, CircleButton, LinkButton, LightButton } from "@/design-system/base/button";
import { CardList } from "@/components/ui/CardList";
import { Modal } from "@/design-system/overlay/modal";
import { Input } from "@/design-system/base/input";
import { HStack } from "@/design-system/layout/stack";
import { actionGetCardsByDeckIdWithNotes, actionDeleteCard, actionResetDeckCards, actionGetTodayStudyStats } from "@/modules/card/card-action";
import { actionGetDeckById, actionUpdateDeck } from "@/modules/deck/deck-action";
import type { ActionOutputCardWithNote } from "@/modules/card/card-action-dto";
import type { ActionOutputTodayStudyStats } from "@/modules/card/card-action-dto";
import type { ActionOutputDeck } from "@/modules/deck/deck-action-dto";
import { toast } from "sonner";
import { DEFAULT_NEW_PER_DAY, DEFAULT_REV_PER_DAY } from "@/shared/constant";


export function InDeck({ deckId, isReadOnly }: { deckId: number; isReadOnly: boolean; }) {
  const [cards, setCards] = useState<ActionOutputCardWithNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAddModal, setAddModal] = useState(false);
  const [openResetModal, setResetModal] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [deckInfo, setDeckInfo] = useState<ActionOutputDeck | null>(null);
  const [todayStats, setTodayStats] = useState<ActionOutputTodayStudyStats | null>(null);
  const [openSettingsModal, setSettingsModal] = useState(false);
  const [settingsForm, setSettingsForm] = useState({ newPerDay: DEFAULT_NEW_PER_DAY, revPerDay: DEFAULT_REV_PER_DAY });
  const [savingSettings, setSavingSettings] = useState(false);
  const router = useRouter();
  const t = useTranslations("deck_id");

  useEffect(() => {
    const fetchCards = async () => {
      setLoading(true);
      try {
        const [cardsResult, deckResult, statsResult] = await Promise.all([
          actionGetCardsByDeckIdWithNotes({ deckId }),
          actionGetDeckById({ deckId }),
          actionGetTodayStudyStats({ deckId }),
        ]);
        
        if (!cardsResult.success || !cardsResult.data) {
          throw new Error(cardsResult.message || "Failed to load cards");
        }
        setCards(cardsResult.data);
        
        if (deckResult.success && deckResult.data) {
          setDeckInfo(deckResult.data);
          setSettingsForm({
            newPerDay: deckResult.data.newPerDay ?? 20,
            revPerDay: deckResult.data.revPerDay ?? 200,
          });
        }
        
        if (statsResult.success && statsResult.data) {
          setTodayStats(statsResult.data);
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

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const result = await actionUpdateDeck({
        deckId,
        newPerDay: settingsForm.newPerDay,
        revPerDay: settingsForm.revPerDay,
      });
      if (result.success) {
        setDeckInfo(prev => prev ? { ...prev, newPerDay: settingsForm.newPerDay, revPerDay: settingsForm.revPerDay } : null);
        setSettingsModal(false);
        toast.success(t("settingsSaved"));
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setSavingSettings(false);
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
            {todayStats && (
              <HStack gap={3} className="mt-2 text-xs text-gray-600">
                <span>{t("todayNew")}: {todayStats.newStudied}</span>
                <span>{t("todayReview")}: {todayStats.reviewStudied}</span>
                <span>{t("todayLearning")}: {todayStats.learningStudied}</span>
              </HStack>
            )}
          </div>

          <div className="flex items-center gap-2">
            <PrimaryButton
              onClick={() => {
                router.push(`/decks/${deckId}/learn`);
              }}
            >
              {t("memorize")}
            </PrimaryButton>
            {!isReadOnly && (
              <>
                <CircleButton
                  onClick={() => setSettingsModal(true)}
                  title={t("settings")}
                >
                  <Settings size={18} className="text-gray-700" />
                </CircleButton>
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

      {/* Settings Modal */}
      <Modal open={openSettingsModal} onClose={() => setSettingsModal(false)} size="sm">
        <Modal.Header>
          <Modal.Title>{t("settingsTitle")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("newPerDay")}
              </label>
              <Input
                type="number"
                variant="bordered"
                value={settingsForm.newPerDay}
                onChange={(e) => setSettingsForm(prev => ({ ...prev, newPerDay: parseInt(e.target.value) || 0 }))}
                min={0}
                max={999}
              />
              <p className="text-xs text-gray-500 mt-1">{t("newPerDayHint")}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("revPerDay")}
              </label>
              <Input
                type="number"
                variant="bordered"
                value={settingsForm.revPerDay}
                onChange={(e) => setSettingsForm(prev => ({ ...prev, revPerDay: parseInt(e.target.value) || 0 }))}
                min={0}
                max={9999}
              />
              <p className="text-xs text-gray-500 mt-1">{t("revPerDayHint")}</p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <LightButton onClick={() => setSettingsModal(false)}>
            {t("cancel")}
          </LightButton>
          <PrimaryButton onClick={handleSaveSettings} loading={savingSettings}>
            {savingSettings ? t("saving") : t("save")}
          </PrimaryButton>
        </Modal.Footer>
      </Modal>
    </PageLayout>
  );
};
