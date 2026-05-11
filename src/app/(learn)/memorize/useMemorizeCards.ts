import { useState, useEffect, useTransition, useCallback, useMemo } from "react";
import { actionGetCardsByDeckId } from "@/modules/card/card-action";
import type { ActionOutputCard } from "@/modules/card/card-action-dto";

export type StudyMode = "order-infinite" | "random-infinite";

export function useMemorizeCards(deckId: number) {
  const [isPending, startTransition] = useTransition();
  const [originalCards, setOriginalCards] = useState<ActionOutputCard[]>([]);
  const [cards, setCards] = useState<ActionOutputCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReversed, setIsReversed] = useState(false);
  const [isDictation, setIsDictation] = useState(false);
  const [studyMode, setStudyMode] = useState<StudyMode>("order-infinite");

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

  const findNextIndex = useCallback(
    (from: number, direction: 1 | -1): number => {
      const len = cards.length;
      if (!isDictation) {
        const next = from + direction;
        return ((next % len) + len) % len;
      }
      for (let i = 1; i <= len; i++) {
        const idx = (((from + direction * i) % len) + len) % len;
        if (cards[idx]?.ipa) return idx;
      }
      return from;
    },
    [cards, isDictation]
  );

  const nextCard = useCallback(() => {
    setCurrentIndex(findNextIndex(currentIndex, 1));
    setShowAnswer(false);
  }, [currentIndex, findNextIndex]);

  const prevCard = useCallback(() => {
    setCurrentIndex(findNextIndex(currentIndex, -1));
    setShowAnswer(false);
  }, [currentIndex, findNextIndex]);

  const currentCard = useMemo(() => cards[currentIndex] ?? null, [cards, currentIndex]);

  return {
    cards,
    originalCards,
    currentIndex,
    showAnswer,
    isLoading,
    isPending,
    error,
    studyMode,
    isReversed,
    isDictation,
    setStudyMode,
    setIsReversed,
    setIsDictation,
    setShowAnswer,
    setCurrentIndex,
    nextCard,
    prevCard,
    shuffleCards,
    currentCard,
  };
}
