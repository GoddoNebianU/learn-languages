"use client";

import { useState, useEffect, useTransition, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import localFont from "next/font/local";
import {
  Layers,
  Check,
  RotateCcw,
  Volume2,
  Headphones,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  List,
  Repeat,
  Infinity,
} from "lucide-react";
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
      return card.meanings
        .map((m) => (m.partOfSpeech ? `${m.partOfSpeech}: ${m.definition}` : m.definition))
        .join("; ");
    }
    return card.word;
  };

  const getBackContent = (card: ActionOutputCard): React.ReactNode => {
    if (isReversed) {
      return <span className="text-center text-xl text-gray-900 md:text-2xl">{card.word}</span>;
    }

    return (
      <VStack align="stretch" gap={2} className="w-full max-w-lg">
        {card.meanings.map((m, idx) => (
          <div key={idx} className="flex gap-3 text-left">
            {m.partOfSpeech && (
              <span className="min-w-[60px] shrink-0 text-sm font-medium text-primary-600">
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

  const cleanupAudio = useCallback(() => {
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    stop();
  }, [stop]);

  const findNextIndex = useCallback(
    (from: number, direction: 1 | -1): number => {
      const len = cards.length;
      if (!isDictation) {
        const next = from + direction;
        return isInfinite ? ((next % len) + len) % len : Math.max(0, Math.min(len - 1, next));
      }
      for (let i = 1; i <= len; i++) {
        const idx = (((from + direction * i) % len) + len) % len;
        if (cards[idx]?.ipa) return idx;
      }
      return from;
    },
    [cards, isDictation, isInfinite]
  );

  const handleNextCard = useCallback(() => {
    const next = findNextIndex(currentIndex, 1);
    if (!isInfinite && next <= currentIndex) return;
    setCurrentIndex(next);
    setShowAnswer(false);
    cleanupAudio();
  }, [currentIndex, findNextIndex, isInfinite, cleanupAudio]);

  const handlePrevCard = useCallback(() => {
    const prev = findNextIndex(currentIndex, -1);
    if (!isInfinite && prev >= currentIndex) return;
    setCurrentIndex(prev);
    setShowAnswer(false);
    cleanupAudio();
  }, [currentIndex, findNextIndex, isInfinite, cleanupAudio]);

  const playTTS = useCallback(
    async (text: string) => {
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
    },
    [isAudioLoading, load, play]
  );

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
          <Skeleton variant="circular" className="mb-4 h-12 w-12" />
          <p className="text-gray-600">{t("loading")}</p>
        </VStack>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <VStack align="center" className="py-12">
          <div className="mb-4 max-w-md rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-600">
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
          <div className="mb-4 text-green-500">
            <Check className="mx-auto h-16 w-16" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-800">{t("allDone")}</h2>
          <p className="mb-6 text-gray-600">{t("allDoneDesc")}</p>
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
    { value: "order-limited", label: t("orderLimited"), icon: <List className="h-4 w-4" /> },
    { value: "order-infinite", label: t("orderInfinite"), icon: <Repeat className="h-4 w-4" /> },
    { value: "random-limited", label: t("randomLimited"), icon: <Shuffle className="h-4 w-4" /> },
    {
      value: "random-infinite",
      label: t("randomInfinite"),
      icon: <Infinity className="h-4 w-4" />,
    },
  ];

  return (
    <PageLayout>
      <HStack justify="between" className="mb-4">
        <HStack gap={2} className="text-gray-600">
          <Layers className="h-5 w-5" />
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
            leftIcon={<RotateCcw className="h-4 w-4" />}
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
            leftIcon={<Headphones className="h-4 w-4" />}
            size="sm"
          >
            {t("dictation")}
          </Button>
        </HStack>
      </VStack>

      <div
        className={`mb-6 flex h-[50dvh] flex-col rounded-xl border border-gray-200 bg-white shadow-sm ${myFont.className}`}
      >
        <div className="flex-1 overflow-y-auto">
          {isDictation ? (
            <>
              <VStack align="center" justify="center" gap={4} className="min-h-[20dvh] p-8">
                {currentCard.ipa ? (
                  <div className="text-center font-mono text-2xl text-gray-700">
                    {currentCard.ipa}
                  </div>
                ) : (
                  <div className="text-lg text-gray-400">{t("noIpa")}</div>
                )}
              </VStack>

              {showAnswer && (
                <>
                  <div className="border-t border-gray-200" />
                  <VStack
                    align="center"
                    justify="center"
                    className="min-h-[20dvh] rounded-b-xl bg-gray-50 p-8"
                  >
                    <div className="text-center text-xl whitespace-pre-line text-gray-900 md:text-2xl">
                      {displayFront}
                    </div>
                    {getBackContent(currentCard)}
                  </VStack>
                </>
              )}
            </>
          ) : (
            <>
              <HStack align="center" justify="center" className="min-h-[20dvh] p-8">
                <div className="text-center text-xl whitespace-pre-line text-gray-900 md:text-2xl">
                  {displayFront}
                </div>
              </HStack>

              {showAnswer && (
                <>
                  <div className="border-t border-gray-200" />
                  <VStack
                    align="center"
                    justify="center"
                    className="min-h-[20dvh] rounded-b-xl bg-gray-50 p-8"
                  >
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
          <Button
            variant="light"
            onClick={handleShowAnswer}
            disabled={isPending}
            className="rounded-full px-8 text-lg"
          >
            {t("showAnswer")}
            <span className="ml-2 text-xs opacity-60">Space</span>
          </Button>
        ) : isFinished ? (
          <VStack align="center" gap={4}>
            <div className="text-green-500">
              <Check className="h-12 w-12" />
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
            <Button variant="light" onClick={handlePrevCard}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <span className="text-sm text-gray-500">
              {t("nextCard")}
              <span className="ml-2 text-xs opacity-60">Space</span>
            </span>
            <Button variant="light" onClick={handleNextCard}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </HStack>
        )}
      </HStack>
    </PageLayout>
  );
};

export { Memorize };
