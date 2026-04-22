"use client";

import { useState, useEffect, useTransition, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import localFont from "next/font/local";
import { Layers, Check, RotateCcw, Volume2, Headphones, ChevronLeft, ChevronRight, Shuffle, List, Repeat, Infinity } from "lucide-react";
import { actionGetCardsByDeckId } from "@/modules/card/card-action";
import type { ActionOutputCard } from "@/modules/card/card-action-dto";
import { PageLayout } from "@/components/ui/PageLayout";
import { Button } from "@/design-system/button";
import { Progress } from "@/design-system/progress";
import { Skeleton } from "@/design-system/skeleton";
import { HStack, VStack } from "@/design-system/stack";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { getTTSUrl, type TTS_SUPPORTED_LANGUAGES } from "@/lib/bigmodel/tts";

const myFont = localFont({
  src: "../../../../../../public/fonts/NotoNaskhArabic-VariableFont_wght.ttf",
});

type StudyMode = "order-limited" | "order-infinite" | "random-limited" | "random-infinite";

interface MemorizeProps {
  deckId: number;
  deckName: string;
}

const Memorize: React.FC<MemorizeProps> = ({ deckId, deckName }) => {
  const t = useTranslations("memorize.review");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const [originalCards, setOriginalCards] = useState<ActionOutputCard[]>([]);
  const [cards, setCards] = useState<ActionOutputCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReversed, setIsReversed] = useState(false);
  const [isDictation, setIsDictation] = useState(false);
  const [studyMode, setStudyMode] = useState<StudyMode>("order-limited");
  const { play, stop, load } = useAudioPlayer();
  const audioUrlRef = useRef<string | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);

  const shuffleCards = useCallback((cardArray: ActionOutputCard[]): ActionOutputCard[] => {
    const shuffled = [...cardArray];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  useEffect(() => {
    let ignore = false;
    
    const loadCards = async () => {
      setIsLoading(true);
      setError(null);
      startTransition(async () => {
        const result = await actionGetCardsByDeckId({ deckId, limit: 100 });
        if (!ignore) {
          if (result.success && result.data) {
            setOriginalCards(result.data);
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

  useEffect(() => {
    if (studyMode.startsWith("random")) {
      setCards(shuffleCards(originalCards));
    } else {
      setCards(originalCards);
    }
    setCurrentIndex(0);
    setShowAnswer(false);
  }, [studyMode, originalCards, shuffleCards]);

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

  const getBackContent = (card: ActionOutputCard): React.ReactNode => {
    if (isReversed) {
      return <span className="text-gray-900 text-xl md:text-2xl text-center">{card.word}</span>;
    }
    
    return (
      <VStack align="stretch" gap={2} className="w-full max-w-lg">
        {card.meanings.map((m, idx) => (
          <div key={idx} className="flex gap-3 text-left">
            {m.partOfSpeech && (
              <span className="text-primary-600 text-sm font-medium min-w-[60px] shrink-0">
                {m.partOfSpeech}
              </span>
            )}
            <span className="text-gray-800">{m.definition}</span>
          </div>
        ))}
      </VStack>
    );
  };

  const handleShowAnswer = useCallback(() => {
    setShowAnswer(true);
  }, []);

  const isInfinite = studyMode.endsWith("infinite");

  const handleNextCard = useCallback(() => {
    if (isInfinite) {
      if (currentIndex >= cards.length - 1) {
        if (studyMode.startsWith("random")) {
          setCards(shuffleCards(originalCards));
        }
        setCurrentIndex(0);
      } else {
        setCurrentIndex(currentIndex + 1);
      }
    } else {
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    }
    setShowAnswer(false);
    setIsReversed(false);
    setIsDictation(false);
    cleanupAudio();
  }, [currentIndex, cards.length, isInfinite, studyMode, originalCards, shuffleCards]);

  const handlePrevCard = useCallback(() => {
    if (isInfinite) {
      if (currentIndex <= 0) {
        setCurrentIndex(cards.length - 1);
      } else {
        setCurrentIndex(currentIndex - 1);
      }
    } else {
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    }
    setShowAnswer(false);
    setIsReversed(false);
    setIsDictation(false);
    cleanupAudio();
  }, [currentIndex, cards.length, isInfinite]);

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
      
      if (audioUrl) {
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
          <Button variant="light" onClick={() => router.push("/decks")}>
            {t("backToDecks")}
          </Button>
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
          <Button variant="light" onClick={() => router.push("/decks")}>
            {t("backToDecks")}
          </Button>
        </VStack>
      </PageLayout>
    );
  }

  const currentCard = getCurrentCard()!;
  const displayFront = getFrontText(currentCard);
  const isFinished = !isInfinite && currentIndex === cards.length - 1 && showAnswer;

  const studyModeOptions: { value: StudyMode; label: string; icon: React.ReactNode }[] = [
    { value: "order-limited", label: t("orderLimited"), icon: <List className="w-4 h-4" /> },
    { value: "order-infinite", label: t("orderInfinite"), icon: <Repeat className="w-4 h-4" /> },
    { value: "random-limited", label: t("randomLimited"), icon: <Shuffle className="w-4 h-4" /> },
    { value: "random-infinite", label: t("randomInfinite"), icon: <Infinity className="w-4 h-4" /> },
  ];

  return (
    <PageLayout>
      <HStack justify="between" className="mb-4">
        <HStack gap={2} className="text-gray-600">
          <Layers className="w-5 h-5" />
          <span className="font-medium">{deckName}</span>
        </HStack>
        {!isInfinite && (
          <span className="text-sm text-gray-500">
            {t("progress", { current: currentIndex + 1, total: cards.length })}
          </span>
        )}
      </HStack>

      {!isInfinite && (
        <Progress 
          value={((currentIndex + 1) / cards.length) * 100}
          showLabel={false}
          animated={false}
          className="mb-6"
        />
      )}

      <VStack gap={2} className="mb-4">
        <HStack justify="center" gap={1} className="flex-wrap">
          {studyModeOptions.map((option) => (
            <Button
              variant="light"
              key={option.value}
              onClick={() => setStudyMode(option.value)}
              selected={studyMode === option.value}
              leftIcon={option.icon}
              size="sm"
            >
              {option.label}
            </Button>
          ))}
        </HStack>
        
        <HStack justify="center" gap={2}>
          <Button
            variant="light"
            onClick={() => {
              setIsReversed(!isReversed);
              setShowAnswer(false);
            }}
            selected={isReversed}
            leftIcon={<RotateCcw className="w-4 h-4" />}
            size="sm"
          >
            {t("reverse")}
          </Button>
          <Button
            variant="light"
            onClick={() => {
              setIsDictation(!isDictation);
            }}
            selected={isDictation}
            leftIcon={<Headphones className="w-4 h-4" />}
            size="sm"
          >
            {t("dictation")}
          </Button>
        </HStack>
      </VStack>

      <div className={`bg-white border border-gray-200 rounded-xl shadow-sm mb-6 h-[50dvh] flex flex-col ${myFont.className}`}>
        <div className="flex-1 overflow-y-auto">
          {isDictation ? (
          <>
            <VStack align="center" justify="center" gap={4} className="p-8 min-h-[20dvh]">
              {currentCard.ipa ? (
                <div className="text-gray-700 text-2xl text-center font-mono">
                  {currentCard.ipa}
                </div>
              ) : (
                <div className="text-gray-400 text-lg">
                  {t("noIpa")}
                </div>
              )}
            </VStack>
            
            {showAnswer && (
              <>
                <div className="border-t border-gray-200" />
                <VStack align="center" justify="center" className="p-8 min-h-[20dvh] bg-gray-50 rounded-b-xl">
                  <div className="text-gray-900 text-xl md:text-2xl text-center whitespace-pre-line">
                    {displayFront}
                  </div>
                  {getBackContent(currentCard)}
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
                <VStack align="center" justify="center" className="p-8 min-h-[20dvh] bg-gray-50 rounded-b-xl">
                  {getBackContent(currentCard)}
                </VStack>
              </>
            )}
          </>
        )}
        </div>
      </div>

      <HStack justify="center">
        {!showAnswer ? (
          <Button variant="light"
            onClick={handleShowAnswer}
            disabled={isPending}
            className="px-8 text-lg rounded-full"
          >
            {t("showAnswer")}
            <span className="ml-2 text-xs opacity-60">Space</span>
          </Button>
        ) : isFinished ? (
          <VStack align="center" gap={4}>
            <div className="text-green-500">
              <Check className="w-12 h-12" />
            </div>
            <p className="text-gray-600">{t("allDoneDesc")}</p>
            <HStack gap={2}>
              <Button variant="light" onClick={() => router.push("/decks")}>
                {t("backToDecks")}
              </Button>
              <Button variant="light" onClick={() => setCurrentIndex(0)}>
                {t("restart")}
              </Button>
            </HStack>
          </VStack>
        ) : (
          <HStack gap={4}>
            <Button variant="light"
              onClick={handlePrevCard}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <span className="text-gray-500 text-sm">
              {t("nextCard")}
              <span className="ml-2 text-xs opacity-60">Space</span>
            </span>
            <Button variant="light"
              onClick={handleNextCard}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </HStack>
        )}
      </HStack>
    </PageLayout>
  );
};

export { Memorize };
