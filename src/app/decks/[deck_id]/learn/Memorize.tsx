"use client";

import { useState, useEffect, useTransition, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import localFont from "next/font/local";
import { Layers, Check, RotateCcw, Volume2, Headphones, ChevronLeft, ChevronRight } from "lucide-react";
import { actionGetCardsByDeckId } from "@/modules/card/card-action";
import type { ActionOutputCard } from "@/modules/card/card-action-dto";
import { PageLayout } from "@/components/ui/PageLayout";
import { LightButton, CircleButton } from "@/design-system/base/button";
import { Progress } from "@/design-system/feedback/progress";
import { Skeleton } from "@/design-system/feedback/skeleton";
import { HStack, VStack } from "@/design-system/layout/stack";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { getTTSUrl, type TTS_SUPPORTED_LANGUAGES } from "@/lib/bigmodel/tts";

const myFont = localFont({
  src: "../../../../../public/fonts/NotoNaskhArabic-VariableFont_wght.ttf",
});

interface MemorizeProps {
  deckId: number;
  deckName: string;
}

const Memorize: React.FC<MemorizeProps> = ({ deckId, deckName }) => {
  const t = useTranslations("memorize.review");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const [cards, setCards] = useState<ActionOutputCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
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
        const result = await actionGetCardsByDeckId({ deckId, limit: 100 });
        if (!ignore) {
          if (result.success && result.data) {
            setCards(result.data);
            setCurrentIndex(0);
            setShowAnswer(false);
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

  const getCurrentCard = (): ActionOutputCard | null => {
    return cards[currentIndex] ?? null;
  };

  const getFrontText = (card: ActionOutputCard): string => {
    if (isReversed) {
      return card.meanings.map((m) => 
        m.partOfSpeech ? `${m.partOfSpeech}: ${m.definition}` : m.definition
      ).join("; ");
    }
    return card.word;
  };

  const getBackText = (card: ActionOutputCard): string => {
    if (isReversed) {
      return card.word;
    }
    return card.meanings.map((m) => 
      m.partOfSpeech ? `${m.partOfSpeech}: ${m.definition}` : m.definition
    ).join("; ");
  };

  const handleShowAnswer = useCallback(() => {
    setShowAnswer(true);
  }, []);

  const handleNextCard = useCallback(() => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
      setIsReversed(false);
      setIsDictation(false);
      cleanupAudio();
    }
  }, [currentIndex, cards.length]);

  const handlePrevCard = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
      setIsReversed(false);
      setIsDictation(false);
      cleanupAudio();
    }
  }, [currentIndex]);

  const cleanupAudio = useCallback(() => {
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    stop();
  }, [stop]);

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
    
    const text = isReversed 
      ? currentCard.meanings.map((m) => m.definition).join("; ")
      : currentCard.word;
    
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
        if (e.key === "ArrowRight" || e.key === " " || e.key === "Enter") {
          e.preventDefault();
          handleNextCard();
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          handlePrevCard();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showAnswer, handleShowAnswer, handleNextCard, handlePrevCard]);

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
  const displayFront = getFrontText(currentCard);
  const displayBack = getBackText(currentCard);

  return (
    <PageLayout>
      <HStack justify="between" className="mb-4">
        <HStack gap={2} className="text-gray-600">
          <Layers className="w-5 h-5" />
          <span className="font-medium">{deckName}</span>
        </HStack>
        <span className="text-sm text-gray-500">
          {t("progress", { current: currentIndex + 1, total: cards.length })}
        </span>
      </HStack>

      <Progress 
        value={((currentIndex + 1) / cards.length) * 100}
        showLabel={false}
        animated={false}
        className="mb-6"
      />

      <HStack justify="center" gap={2} className="mb-4">
        <LightButton
          onClick={() => {
            setIsReversed(!isReversed);
            setShowAnswer(false);
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
                  <div className="text-gray-900 text-xl md:text-2xl text-center whitespace-pre-line">
                    {displayFront}
                  </div>
                  {currentCard.ipa && (
                    <div className="text-gray-500 text-sm mt-2">
                      {currentCard.ipa}
                    </div>
                  )}
                  <div className="text-gray-600 text-lg mt-4 text-center whitespace-pre-line">
                    {displayBack}
                  </div>
                </VStack>
              </>
            )}
          </>
        ) : (
          <>
            <HStack align="center" justify="center" className="p-8 min-h-[20dvh]">
              <div className="text-gray-900 text-xl md:text-2xl text-center whitespace-pre-line">
                {displayFront}
              </div>
            </HStack>
            
            {showAnswer && (
              <>
                <div className="border-t border-gray-200" />
                <HStack align="center" justify="center" className="p-8 min-h-[20dvh] bg-gray-50 rounded-b-xl">
                  <div className="text-gray-900 text-xl md:text-2xl text-center whitespace-pre-line">
                    {displayBack}
                  </div>
                </HStack>
              </>
            )}
          </>
        )}
      </div>

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
          <HStack gap={4}>
            <LightButton
              onClick={handlePrevCard}
              disabled={currentIndex === 0}
              className="px-4 py-2"
            >
              <ChevronLeft className="w-5 h-5" />
            </LightButton>
            <span className="text-gray-500 text-sm">
              {t("nextCard")}
              <span className="ml-2 text-xs opacity-60">Space</span>
            </span>
            <LightButton
              onClick={handleNextCard}
              disabled={currentIndex === cards.length - 1}
              className="px-4 py-2"
            >
              <ChevronRight className="w-5 h-5" />
            </LightButton>
          </HStack>
        )}
      </HStack>
    </PageLayout>
  );
};

export { Memorize };
