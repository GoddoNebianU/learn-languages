"use client";

import { useState, useEffect, useTransition, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import localFont from "next/font/local";
import { Layers, Check, Clock, Sparkles, RotateCcw, Volume2, Headphones } from "lucide-react";
import type { ActionOutputCardWithNote, ActionOutputScheduledCard } from "@/modules/card/card-action-dto";
import { actionGetCardsForReview, actionAnswerCard } from "@/modules/card/card-action";
import { PageLayout } from "@/components/ui/PageLayout";
import { LightButton } from "@/design-system/base/button";
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
  const [dictationInput, setDictationInput] = useState("");
  const [dictationResult, setDictationResult] = useState<"correct" | "incorrect" | null>(null);
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
            setDictationInput("");
            setDictationResult(null);
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
    
    if (isDictation) {
      const currentCard = getCurrentCard();
      if (currentCard) {
        const fields = getNoteFields(currentCard);
        const answer = isReversed ? (fields[0] ?? "") : (fields[1] ?? "");
        const normalizedInput = dictationInput.trim().toLowerCase();
        const normalizedAnswer = answer.trim().toLowerCase();
        setDictationResult(normalizedInput === normalizedAnswer ? "correct" : "incorrect");
      }
    }
  }, [isDictation, dictationInput, isReversed]);

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
        setDictationInput("");
        setDictationResult(null);
        
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

  const getCardTypeColor = (type: CardType): string => {
    switch (type) {
      case CardType.NEW:
        return "bg-blue-100 text-blue-700";
      case CardType.LEARNING:
        return "bg-yellow-100 text-yellow-700";
      case CardType.REVIEW:
        return "bg-green-100 text-green-700";
      case CardType.RELEARNING:
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">{t("loading")}</p>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <LightButton onClick={() => router.push("/decks")} className="px-4 py-2">
            {t("backToDecks")}
          </LightButton>
        </div>
      </PageLayout>
    );
  }

  if (cards.length === 0) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <div className="text-green-500 mb-4">
            <Check className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t("allDone")}</h2>
          <p className="text-gray-600 mb-6">{t("allDoneDesc")}</p>
          <LightButton onClick={() => router.push("/decks")} className="px-4 py-2">
            {t("backToDecks")}
          </LightButton>
        </div>
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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-gray-600">
          <Layers className="w-5 h-5" />
          <span className="font-medium">{deckName}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs px-2 py-0.5 rounded-full ${getCardTypeColor(currentCard.type)}`}>
            {getCardTypeLabel(currentCard.type)}
          </span>
          <span className="text-sm text-gray-500">
            {t("progress", { current: currentIndex + 1, total: cards.length + currentIndex })}
          </span>
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${Math.max(0, ((currentIndex) / (cards.length + currentIndex)) * 100)}%` }}
        />
      </div>

      {lastScheduled && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>
              {t("nextReview")}: {formatNextReview(lastScheduled)}
            </span>
          </div>
        </div>
      )}

      <div className="flex justify-center gap-2 mb-4">
        <button
          onClick={() => {
            setIsReversed(!isReversed);
            setDictationInput("");
            setDictationResult(null);
          }}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
            isReversed 
              ? "bg-indigo-100 text-indigo-700" 
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          {t("reverse")}
        </button>
        <button
          onClick={() => {
            setIsDictation(!isDictation);
            setDictationInput("");
            setDictationResult(null);
          }}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
            isDictation 
              ? "bg-purple-100 text-purple-700" 
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <Headphones className="w-4 h-4" />
          {t("dictation")}
        </button>
      </div>

      <div className={`bg-white border border-gray-200 rounded-xl shadow-sm mb-6 ${myFont.className}`}>
        {isDictation ? (
          <>
            <div className="p-8 min-h-[20dvh] flex flex-col items-center justify-center gap-4">
              <button
                onClick={playCurrentCard}
                disabled={isAudioLoading}
                className="p-4 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors disabled:opacity-50"
              >
                <Volume2 className="w-8 h-8" />
              </button>
              <p className="text-gray-500 text-sm">{t("clickToPlay")}</p>
            </div>
            
            {showAnswer ? (
              <>
                <div className="border-t border-gray-200" />
                <div className="p-8 min-h-[20dvh] flex flex-col items-center justify-center bg-gray-50 rounded-b-xl gap-4">
                  <div className="w-full max-w-md">
                    <label className="block text-sm text-gray-600 mb-2">{t("yourAnswer")}</label>
                    <input
                      type="text"
                      value={dictationInput}
                      onChange={(e) => setDictationInput(e.target.value)}
                      className={`w-full p-3 border rounded-lg text-lg ${
                        dictationResult === "correct" 
                          ? "border-green-500 bg-green-50" 
                          : dictationResult === "incorrect"
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                      readOnly
                    />
                  </div>
                  <div className="text-center">
                    <p className={`text-lg font-medium ${
                      dictationResult === "correct" ? "text-green-600" : "text-red-600"
                    }`}>
                      {dictationResult === "correct" ? "✓ " + t("correct") : "✗ " + t("incorrect")}
                    </p>
                    {dictationResult === "incorrect" && (
                      <p className="text-gray-900 text-xl mt-2">{displayBack}</p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-xl">
                <input
                  type="text"
                  value={dictationInput}
                  onChange={(e) => setDictationInput(e.target.value)}
                  placeholder={t("typeWhatYouHear")}
                  className="w-full p-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
            )}
          </>
        ) : (
          <>
            <div className="p-8 min-h-[20dvh] flex items-center justify-center">
              <div className="text-gray-900 text-xl md:text-2xl text-center">
                {displayFront}
              </div>
            </div>
            
            {showAnswer && (
              <>
                <div className="border-t border-gray-200" />
                <div className="p-8 min-h-[20dvh] flex items-center justify-center bg-gray-50 rounded-b-xl">
                  <div className="text-gray-900 text-xl md:text-2xl text-center">
                    {displayBack}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>

      <div className="flex justify-center gap-4 mb-6 text-sm text-gray-500">
        <span>{t("interval")}: {formatInterval(currentCard.ivl)}</span>
        <span>•</span>
        <span>{t("ease")}: {currentCard.factor / 10}%</span>
        <span>•</span>
        <span>{t("lapses")}: {currentCard.lapses}</span>
      </div>

      <div className="flex justify-center">
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
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => handleAnswer(1)}
              disabled={isPending}
              className="flex flex-col items-center px-5 py-3 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 transition-colors disabled:opacity-50 min-w-[80px]"
            >
              <span className="font-medium">{t("again")}</span>
              <span className="text-xs opacity-75">{formatPreviewInterval(previewIntervals.again)}</span>
              <span className="text-xs opacity-50 mt-1">1</span>
            </button>
            
            <button
              onClick={() => handleAnswer(2)}
              disabled={isPending}
              className="flex flex-col items-center px-5 py-3 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-700 transition-colors disabled:opacity-50 min-w-[80px]"
            >
              <span className="font-medium">{t("hard")}</span>
              <span className="text-xs opacity-75">{formatPreviewInterval(previewIntervals.hard)}</span>
              <span className="text-xs opacity-50 mt-1">2</span>
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
              <span className="text-xs opacity-50 mt-1">3/Space</span>
            </button>
            
            <button
              onClick={() => handleAnswer(4)}
              disabled={isPending}
              className="flex flex-col items-center px-5 py-3 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors disabled:opacity-50 min-w-[80px]"
            >
              <span className="font-medium">{t("easy")}</span>
              <span className="text-xs opacity-75">{formatPreviewInterval(previewIntervals.easy)}</span>
              <span className="text-xs opacity-50 mt-1">4</span>
            </button>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export { Memorize };
