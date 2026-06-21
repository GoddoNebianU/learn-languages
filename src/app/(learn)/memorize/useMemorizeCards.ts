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
  const [isCardMode, setIsCardMode] = useState(false);
  const [studyMode, setStudyMode] = useState<StudyMode>("order-infinite");
  const [groupSize, setGroupSizeState] = useState(0);
  const [currentGroup, setCurrentGroup] = useState(0);

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
          setIsCardMode(false);
          setCurrentGroup(0);
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
    setCurrentGroup(0);
    setShowAnswer(false);
  }, [studyMode, originalCards, shuffleCards]);

  const totalGroups = groupSize > 0 ? Math.ceil(cards.length / groupSize) : 1;
  const groupStart = groupSize > 0 ? currentGroup * groupSize : 0;
  const groupEnd = groupSize > 0 ? Math.min(groupStart + groupSize, cards.length) : cards.length;

  const findNextIndex = useCallback(
    (from: number, direction: 1 | -1): number => {
      if (groupSize > 0) {
        const gLen = groupEnd - groupStart;
        const relIdx = from - groupStart;
        return groupStart + (((relIdx + direction) % gLen) + gLen) % gLen;
      }
      const len = cards.length;
      const next = from + direction;
      return ((next % len) + len) % len;
    },
    [cards.length, groupSize, groupStart, groupEnd]
  );

  const setGroupSize = useCallback((size: number) => {
    setGroupSizeState(size);
    setCurrentGroup(0);
    setCurrentIndex(0);
    setShowAnswer(false);
  }, []);

  const goToGroup = useCallback(
    (group: number) => {
      if (group < 0 || group >= totalGroups) return;
      setCurrentGroup(group);
      setCurrentIndex(group * groupSize);
      setShowAnswer(false);
    },
    [totalGroups, groupSize]
  );

  const nextGroup = useCallback(() => goToGroup(currentGroup + 1), [currentGroup, goToGroup]);
  const prevGroup = useCallback(() => goToGroup(currentGroup - 1), [currentGroup, goToGroup]);

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
    shuffleCards,
    currentCard,
  };
}
