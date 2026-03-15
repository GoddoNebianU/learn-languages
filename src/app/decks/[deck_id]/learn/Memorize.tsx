"use client";

import { useState, useEffect, useTransition, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import localFont from "next/font/local";
import { Layers, Check, Clock, Sparkles, RotateCcw, Volume2, Headphones } from "lucide-react";
import type { ActionOutputCardWithNote, ActionOutputScheduledCard } from "@/modules/card/card-action-dto";
import { actionGetCardsForReview, actionAnswerCard } from "@/modules/card/card-action";
import { PageLayout } from "@/components/ui/PageLayout";
import { LightButton, CircleButton } from "@/design-system/base/button";
import { Badge } from "@/design-system/data-display/badge";
import { Progress } from "@/design-system/feedback/progress";
import { Skeleton } from "@/design-system/feedback/skeleton";
import { HStack, VStack } from "@/design-system/layout/stack";
import { CardType } from "../../../../../generated/prisma/enums";
import { calculatePreviewIntervals, formatPreviewInterval, type CardPreview } from "./interval-preview";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { getTTSUrl, type TTS_SUPPORTED_LANGUAGES } from "@/lib/bigmodel/tts";

const myFont = localFont({
  src: "../../../../../public/fonts/NotoNaskhArabic-VariableFont_wght.ttf",
});

interface MemorizeProps {
  deckId: number;
  deckName: string;
}

type ReviewEase = 1 | 2 | 3 | 4;

const Memorize: React.FC<MemorizeProps> = ({ deckId, deckName }) => {
  const t = useTranslations("memorize.review");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const [cards, setCards] = useState<ActionOutputCardWithNote[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [lastScheduled, setLastScheduled] = useState<ActionOutputScheduledCard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReversed, setIsReversed] = useState(false);
  const [isDictation, setIsDictation] = useState(false);
  const { play, stop, load } = useAudioPlayer();
  const audioUrlRef = useRef<string | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);

  useEffect(() => {
    let ignore = false;
    
    const loadCards = async () => {
      setIsLoading(true);
      setError(null);
      startTransition(async () => {
        const result = await actionGetCardsForReview({ deckId, limit: 50 });
        if (!ignore) {
          if (result.success && result.data) {
            setCards(result.data);
            setCurrentIndex(0);
            setShowAnswer(false);
            setLastScheduled(null);
            setIsReversed(false);
            setIsDictation(false);
          } else {
            setError(result.message);
          }
          setIsLoading(false);
        }
      });
    };
    
    loadCards();
    
    return () => {
      ignore = true;
    };
  }, [deckId]);

  const getCurrentCard = (): ActionOutputCardWithNote | null => {
    return cards[currentIndex] ?? null;
  };

  const getNoteFields = (card: ActionOutputCardWithNote): string[] => {
    return card.note.flds.split('\x1f');
  };

  const handleShowAnswer = useCallback(() => {
    setShowAnswer(true);
  }, []);

  const handleAnswer = useCallback((ease: ReviewEase) => {
    const card = getCurrentCard();
    if (!card) return;

    startTransition(async () => {
      const result = await actionAnswerCard({
        cardId: BigInt(card.id),
        ease,
      });

      if (result.success && result.data) {
        setLastScheduled(result.data.scheduled);
        
        const remainingCards = cards.filter((_, idx) => idx !== currentIndex);
        setCards(remainingCards);
        
        if (remainingCards.length === 0) {
          setCurrentIndex(0);
        } else if (currentIndex >= remainingCards.length) {
          setCurrentIndex(remainingCards.length - 1);
        }
        
        setShowAnswer(false);
        setIsReversed(false);
        setIsDictation(false);
        
        if (audioUrlRef.current) {
          URL.revokeObjectURL(audioUrlRef.current);
          audioUrlRef.current = null;
        }
        stop();
      } else {
        setError(result.message);
      }
    });
  }, [cards, currentIndex, stop]);

  const playTTS = useCallback(async (text: string) => {
    if (isAudioLoading) return;
    
    setIsAudioLoading(true);
    try {
      const hasChinese = /[\u4e00-\u9fff]/.test(text);
      const hasJapanese = /[\u3040-\u309f\u30a0-\u30ff]/.test(text);
      const hasKorean = /[\uac00-\ud7af]/.test(text);
      
      let lang: TTS_SUPPORTED_LANGUAGES = "Auto";
      if (hasChinese) lang = "Chinese";
      else if (hasJapanese) lang = "Japanese";
      else if (hasKorean) lang = "Korean";
      else if (/^[a-zA-Z\s]/.test(text)) lang = "English";
      
      const audioUrl = await getTTSUrl(text, lang);
      
      if (audioUrl && audioUrl !== "error") {
        audioUrlRef.current = audioUrl;
        await load(audioUrl);
        play();
      }
    } catch (e) {
      console.error("TTS playback failed", e);
    } finally {
      setIsAudioLoading(false);
    }
  }, [isAudioLoading, load, play]);

  const playCurrentCard = useCallback(() => {
    const currentCard = getCurrentCard();
    if (!currentCard) return;
    
    const fields = getNoteFields(currentCard);
    const text = isReversed ? (fields[1] ?? "") : (fields[0] ?? "");
    
    if (text) {
      playTTS(text);
    }
  }, [isReversed, playTTS]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (!showAnswer) {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          handleShowAnswer();
        }
      } else {
        if (e.key === "1") {
          e.preventDefault();
          handleAnswer(1);
        } else if (e.key === "2") {
          e.preventDefault();
          handleAnswer(2);
        } else if (e.key === "3" || e.key === " " || e.key === "Enter") {
          e.preventDefault();
          handleAnswer(3);
        } else if (e.key === "4") {
          e.preventDefault();
          handleAnswer(4);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showAnswer, handleShowAnswer, handleAnswer]);

  const formatNextReview = (scheduled: ActionOutputScheduledCard): string => {
    const now = new Date();
    const nextReview = new Date(scheduled.nextReviewDate);
    const diffMs = nextReview.getTime() - now.getTime();
    
    if (diffMs < 0) return t("now");
    
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return t("lessThanMinute");
    if (diffMins < 60) return t("inMinutes", { count: diffMins });
    if (diffHours < 24) return t("inHours", { count: diffHours });
    if (diffDays < 30) return t("inDays", { count: diffDays });
    return t("inMonths", { count: Math.floor(diffDays / 30) });
  };

  const formatInterval = (ivl: number): string => {
    if (ivl < 1) return t("minutes");
    if (ivl < 30) return t("days", { count: ivl });
    return t("months", { count: Math.floor(ivl / 30) });
  };

  const getCardTypeLabel = (type: CardType): string => {
    switch (type) {
      case CardType.NEW:
        return t("cardTypeNew");
      case CardType.LEARNING:
        return t("cardTypeLearning");
      case CardType.REVIEW:
        return t("cardTypeReview");
      case CardType.RELEARNING:
        return t("cardTypeRelearning");
      default:
        return "";
    }
  };

  const getCardTypeVariant = (type: CardType): "info" | "warning" | "success" | "primary" => {
    switch (type) {
      case CardType.NEW:
        return "info";
      case CardType.LEARNING:
        return "warning";
      case CardType.REVIEW:
        return "success";
      case CardType.RELEARNING:
        return "primary";
      default:
        return "info";
    }
  };

  if (isLoading) {
    return (
      <PageLayout>
        <VStack align="center" className="py-12">
          <Skeleton variant="circular" className="h-12 w-12 mb-4" />
          <p className="text-gray-600">{t("loading")}</p>
        </VStack>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <VStack align="center" className="py-12">
          <div className="text-red-600 mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg max-w-md">
            {error}
          </div>
          <LightButton onClick={() => router.push("/decks")} className="px-4 py-2">
            {t("backToDecks")}
          </LightButton>
        </VStack>
      </PageLayout>
    );
  }

  if (cards.length === 0) {
    return (
      <PageLayout>
        <VStack align="center" className="py-12">
          <div className="text-green-500 mb-4">
            <Check className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t("allDone")}</h2>
          <p className="text-gray-600 mb-6">{t("allDoneDesc")}</p>
          <LightButton onClick={() => router.push("/decks")} className="px-4 py-2">
            {t("backToDecks")}
          </LightButton>
        </VStack>
      </PageLayout>
    );
  }

  const currentCard = getCurrentCard()!;
  const fields = getNoteFields(currentCard);
  const front = fields[0] ?? "";
  const back = fields[1] ?? "";
  
  const displayFront = isReversed ? back : front;
  const displayBack = isReversed ? front : back;

  const cardPreview: CardPreview = {
    type: currentCard.type,
    ivl: currentCard.ivl,
    factor: currentCard.factor,
    left: currentCard.left,
  };
  const previewIntervals = calculatePreviewIntervals(cardPreview);

  return (
    <PageLayout>
      <HStack justify="between" className="mb-4">
        <HStack gap={2} className="text-gray-600">
          <Layers className="w-5 h-5" />
          <span className="font-medium">{deckName}</span>
        </HStack>
        <HStack gap={3}>
          <Badge variant={getCardTypeVariant(currentCard.type)} size="sm">
            {getCardTypeLabel(currentCard.type)}
          </Badge>
          <span className="text-sm text-gray-500">
            {t("progress", { current: currentIndex + 1, total: cards.length + currentIndex })}
          </span>
        </HStack>
      </HStack>

      <Progress 
        value={Math.max(0, ((currentIndex) / (cards.length + currentIndex)) * 100)}
        showLabel={false}
        animated={false}
        className="mb-6"
      />

      {lastScheduled && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
          <HStack gap={2}>
            <Clock className="w-4 h-4" />
            <span>
              {t("nextReview")}: {formatNextReview(lastScheduled)}
            </span>
          </HStack>
        </div>
      )}

      <HStack justify="center" gap={2} className="mb-4">
        <LightButton
          onClick={() => {
            setIsReversed(!isReversed);
          }}
          selected={isReversed}
          leftIcon={<RotateCcw className="w-4 h-4" />}
          size="sm"
        >
          {t("reverse")}
        </LightButton>
        <LightButton
          onClick={() => {
            setIsDictation(!isDictation);
          }}
          selected={isDictation}
          leftIcon={<Headphones className="w-4 h-4" />}
          size="sm"
        >
          {t("dictation")}
        </LightButton>
      </HStack>

      <div className={`bg-white border border-gray-200 rounded-xl shadow-sm mb-6 ${myFont.className}`}>
        {isDictation ? (
          <>
            <VStack align="center" justify="center" gap={4} className="p-8 min-h-[20dvh]">
              <CircleButton
                onClick={playCurrentCard}
                disabled={isAudioLoading}
                className="p-4 bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors disabled:opacity-50"
              >
                <Volume2 className="w-8 h-8" />
              </CircleButton>
              <p className="text-gray-500 text-sm">{t("clickToPlay")}</p>
            </VStack>
            
            {showAnswer && (
              <>
                <div className="border-t border-gray-200" />
                <VStack align="center" justify="center" className="p-8 min-h-[20dvh] bg-gray-50 rounded-b-xl">
                  <div className="text-gray-900 text-xl md:text-2xl text-center">
                    {displayBack}
                  </div>
                </VStack>
              </>
            )}
          </>
        ) : (
          <>
            <HStack align="center" justify="center" className="p-8 min-h-[20dvh]">
              <div className="text-gray-900 text-xl md:text-2xl text-center">
                {displayFront}
              </div>
            </HStack>
            
            {showAnswer && (
              <>
                <div className="border-t border-gray-200" />
                <HStack align="center" justify="center" className="p-8 min-h-[20dvh] bg-gray-50 rounded-b-xl">
                  <div className="text-gray-900 text-xl md:text-2xl text-center">
                    {displayBack}
                  </div>
                </HStack>
              </>
            )}
          </>
        )}
      </div>

      <HStack justify="center" gap={4} className="mb-6 text-sm text-gray-500">
        <span>{t("interval")}: {formatInterval(currentCard.ivl)}</span>
        <span>•</span>
        <span>{t("ease")}: {currentCard.factor / 10}%</span>
        <span>•</span>
        <span>{t("lapses")}: {currentCard.lapses}</span>
      </HStack>

      <HStack justify="center">
        {!showAnswer ? (
          <LightButton
            onClick={handleShowAnswer}
            disabled={isPending}
            className="px-8 py-3 text-lg rounded-full"
          >
            {t("showAnswer")}
            <span className="ml-2 text-xs opacity-60">Space</span>
          </LightButton>
        ) : (
          <HStack wrap justify="center" gap={3}>
            <button
              onClick={() => handleAnswer(1)}
              disabled={isPending}
              className="flex flex-col items-center px-5 py-3 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 transition-colors disabled:opacity-50 min-w-[80px]"
            >
              <span className="font-medium">{t("again")}</span>
              <span className="text-xs opacity-75">{formatPreviewInterval(previewIntervals.again)}</span>
            </button>
            
            <button
              onClick={() => handleAnswer(2)}
              disabled={isPending}
              className="flex flex-col items-center px-5 py-3 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-700 transition-colors disabled:opacity-50 min-w-[80px]"
            >
              <span className="font-medium">{t("hard")}</span>
              <span className="text-xs opacity-75">{formatPreviewInterval(previewIntervals.hard)}</span>
            </button>
            
            <button
              onClick={() => handleAnswer(3)}
              disabled={isPending}
              className="flex flex-col items-center px-5 py-3 rounded-xl bg-green-100 hover:bg-green-200 text-green-700 transition-colors disabled:opacity-50 min-w-[80px] ring-2 ring-green-300"
            >
              <div className="flex items-center gap-1">
                <span className="font-medium">{t("good")}</span>
                <Sparkles className="w-3 h-3 opacity-60" />
              </div>
              <span className="text-xs opacity-75">{formatPreviewInterval(previewIntervals.good)}</span>
            </button>
            
            <button
              onClick={() => handleAnswer(4)}
              disabled={isPending}
              className="flex flex-col items-center px-5 py-3 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors disabled:opacity-50 min-w-[80px]"
            >
              <span className="font-medium">{t("easy")}</span>
              <span className="text-xs opacity-75">{formatPreviewInterval(previewIntervals.easy)}</span>
            </button>
          </HStack>
        )}
      </HStack>
    </PageLayout>
  );
};

export { Memorize };
