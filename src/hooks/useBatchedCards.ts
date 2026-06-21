"use client";

import { useState, useEffect } from "react";
import { actionGetCardsByDeckId, actionGetCardCount } from "@/modules/card/card-action";
import type { ActionOutputCard } from "@/modules/card/card-action-dto";

const BATCH_SIZE = 50;

export function useBatchedCards(deckId: number) {
  const [cards, setCards] = useState<ActionOutputCard[]>([]);
  const [total, setTotal] = useState(0);
  const [loaded, setLoaded] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadAll() {
      setIsLoading(true);
      setError(null);
      setCards([]);
      setLoaded(0);

      try {
        // Step 1: get total count
        const countResult = await actionGetCardCount({ deckId });
        if (ignore) return;
        if (!countResult.success || countResult.data === undefined) {
          setError(countResult.message);
          setIsLoading(false);
          return;
        }
        setTotal(countResult.data.total);

        // Step 2: load in batches
        let offset = 0;
        const allCards: ActionOutputCard[] = [];
        while (true) {
          const result = await actionGetCardsByDeckId({ deckId, limit: BATCH_SIZE, offset });
          if (ignore) return;
          if (!result.success || !result.data) {
            setError(result.message);
            setIsLoading(false);
            return;
          }
          allCards.push(...result.data);
          setCards([...allCards]);
          setLoaded(allCards.length);
          if (result.data.length < BATCH_SIZE) break; // last batch
          offset += BATCH_SIZE;
        }
        if (!ignore) setIsLoading(false);
      } catch (e) {
        if (!ignore) {
          setError(e instanceof Error ? e.message : "Failed to load cards");
          setIsLoading(false);
        }
      }
    }

    loadAll();
    return () => {
      ignore = true;
    };
  }, [deckId]);

  const progress = total > 0 ? Math.round((loaded / total) * 100) : 0;

  return { cards, total, loaded, isLoading, error, progress };
}
