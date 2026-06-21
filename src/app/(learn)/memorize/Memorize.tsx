"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  Layers,
  Check,
  RotateCcw,
  Headphones,
  ChevronLeft,
  ChevronRight,
  Repeat,
  Infinity,
  BookOpen,
  LayoutGrid,
} from "lucide-react";
import { PageLayout } from "@/components/ui/PageLayout";
import { Button } from "@/design-system/button";
import { Skeleton } from "@/design-system/skeleton";
import { HStack, VStack } from "@/design-system/stack";
import { Range } from "@/design-system/range";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { getTTSUrl } from "@/lib/providers/tts";
import type { TTS_SUPPORTED_LANGUAGES } from "@/lib/providers/tts-languages";
import { useMemorizeCards } from "./useMemorizeCards";
import type { StudyMode } from "./useMemorizeCards";
import { MemorizeCard } from "./MemorizeCard";

interface MemorizeProps {
  deckId: number;
  deckName: string;
}

const Memorize: React.FC<MemorizeProps> = ({ deckId, deckName }) => {
  const t = useTranslations("memorize.review");
  const router = useRouter();

  const {
    cards,
    currentIndex,
    showAnswer,
    isLoading,
    isPending,
    error,
    studyMode,
    isReversed,
    isDictation,
    isCardMode,
    groupSize,
    currentGroup,
    totalGroups,
    groupStart,
    groupEnd,
    setStudyMode,
    setIsReversed,
    setIsDictation,
    setIsCardMode,
    setGroupSize,
    nextGroup,
    prevGroup,
    setShowAnswer,
    setCurrentIndex,
    nextCard,
    prevCard,
    currentCard,
  } = useMemorizeCards(deckId);

  const { play, stop, load } = useAudioPlayer();
  const audioUrlRef = useRef<string | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);

  const cleanupAudio = () => {
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    stop();
    setIsAudioLoading(false);
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleNextCard = () => {
    nextCard();
    cleanupAudio();
  };

  const handlePrevCard = () => {
    prevCard();
    cleanupAudio();
  };

  const playTTS = async (text: string) => {
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
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (!showAnswer && !isCardMode) {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          handleShowAnswer();
        }
      } else {
        if (e.key === "ArrowRight" || e.key === " " || e.key === "Enter") {
          e.preventDefault();
          handleNextCard();
        } else if (e.key === "ArrowLeft" && !studyMode.startsWith("random")) {
          e.preventDefault();
          handlePrevCard();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showAnswer, isCardMode, handleShowAnswer, handleNextCard, handlePrevCard]);

  useEffect(() => {
    if (!isDictation || !currentCard) return;
    const text = isReversed
      ? currentCard.meanings.map((m) => (m.partOfSpeech ? `${m.partOfSpeech}: ${m.definition}` : m.definition)).join("; ")
      : currentCard.word;
    if (text) playTTS(text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, isDictation]);

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

  const studyModeOptions: { value: StudyMode; label: string; icon: React.ReactNode }[] = [
    { value: "order-infinite", label: t("orderInfinite"), icon: <Repeat className="h-4 w-4" /> },
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
        <span className="text-sm text-gray-500">
          {t("progress", { current: currentIndex + 1, total: cards.length })}
        </span>
      </HStack>

      {!studyMode.startsWith("random") && (
        <Range
          value={currentIndex}
          min={groupStart}
          max={Math.max(groupStart, groupEnd - 1)}
          onChange={(value) => {
            setCurrentIndex(value);
            setShowAnswer(false);
            cleanupAudio();
          }}
          className="mb-4"
        />
      )}

      {groupSize > 0 && totalGroups > 1 && (
        <HStack justify="center" gap={4} className="mb-4">
          <Button
            variant="light"
            onClick={prevGroup}
            disabled={currentGroup === 0}
            size="sm"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-500">
            {t("groupProgress", { current: currentGroup + 1, total: totalGroups })}
          </span>
          <Button
            variant="light"
            onClick={nextGroup}
            disabled={currentGroup >= totalGroups - 1}
            size="sm"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </HStack>
      )}

      <HStack justify="center" gap={2} className="mb-4 flex-wrap">
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
        <Button
          variant="light"
          onClick={() => {
            setIsCardMode(!isCardMode);
            setShowAnswer(false);
          }}
          selected={isCardMode}
          leftIcon={<BookOpen className="h-4 w-4" />}
          size="sm"
        >
          {t("cardMode")}
        </Button>
        <Button
          variant="light"
          onClick={() => setGroupSize(groupSize > 0 ? 0 : 10)}
          selected={groupSize > 0}
          leftIcon={<LayoutGrid className="h-4 w-4" />}
          size="sm"
        >
          {t("group")}
        </Button>
        {groupSize > 0 &&
          ([10, 20, 50] as const).map((size) => (
            <Button
              key={size}
              variant="light"
              onClick={() => setGroupSize(size)}
              selected={groupSize === size}
              size="sm"
            >
              {size}
            </Button>
          ))}
      </HStack>

      <MemorizeCard
        card={currentCard!}
        showAnswer={showAnswer}
        isReversed={isReversed}
        isDictation={isDictation}
        isCardMode={isCardMode}
        isAudioLoading={isAudioLoading}
        onPlayText={playTTS}
      />

      <HStack justify="center">
        {!showAnswer && !isCardMode ? (
          <Button
            variant="light"
            onClick={handleShowAnswer}
            disabled={isPending}
            className="rounded-full px-8 text-lg"
          >
            {t("showAnswer")}
            <span className="ml-2 text-xs opacity-60">Space</span>
          </Button>
        ) : (
          <HStack gap={4}>
            {!studyMode.startsWith("random") && (
              <Button variant="light" onClick={handlePrevCard}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
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
