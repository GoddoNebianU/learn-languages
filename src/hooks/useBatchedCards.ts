"use client";

import { useState, useEffect } from "react";
import { actionGetCardsByDeckId, actionGetCardHash } from "@/modules/card/card-action";
import type { ActionOutputCard } from "@/modules/card/card-action-dto";
import { useCardCache } from "@/lib/browser/card-cache";

const BATCH_SIZE = 200;

export function useBatchedCards(deckId: number, includeHidden: boolean = false) {
  const [cards, setCards] = useState<ActionOutputCard[]>([]);
  const [total, setTotal] = useState(0);
  const [loaded, setLoaded] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cacheGet = useCardCache((s) => s.get);
  const cacheSet = useCardCache((s) => s.set);

  useEffect(() => {
    let ignore = false;

    async function loadAll() {
      // Serve cached cards instantly (stale-while-revalidate)
      const cached = cacheGet(deckId, includeHidden);
      if (cached) {
        setCards(cached.cards);
        setLoaded(cached.cards.length);
        setTotal(cached.cards.length);
      } else {
        setCards([]);
        setLoaded(0);
      }

      setIsLoading(true);
      setError(null);

      try {
        // Fetch cheap hash from server
        const hashResult = await actionGetCardHash({ deckId, includeHidden });
        if (ignore) return;
        if (!hashResult.success || !hashResult.data) {
          setError(hashResult.message);
          setIsLoading(false);
          return;
        }

        const serverHash = `${hashResult.data.total}:${hashResult.data.lastModified}`;

        // Cache hit — hash matches, skip full fetch
        if (cached && cached.hash === serverHash) {
          setTotal(hashResult.data.total);
          setIsLoading(false);
          return;
        }

        // Cache miss — full batch fetch
        setTotal(hashResult.data.total);
        if (!cached) {
          setCards([]);
          setLoaded(0);
        }

        let offset = 0;
        const allCards: ActionOutputCard[] = [];
        while (true) {
          const result = await actionGetCardsByDeckId({ deckId, limit: BATCH_SIZE, offset, includeHidden });
          if (ignore) return;
          if (!result.success || !result.data) {
            setError(result.message);
            setIsLoading(false);
            return;
          }
          allCards.push(...result.data);
          setCards([...allCards]);
          setLoaded(allCards.length);
          if (result.data.length < BATCH_SIZE) break;
          offset += BATCH_SIZE;
        }

        cacheSet(deckId, includeHidden, serverHash, allCards);
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
  }, [deckId, includeHidden, cacheGet, cacheSet]);

  const progress = total > 0 ? Math.round((loaded / total) * 100) : 0;

  return { cards, total, loaded, isLoading, error, progress };
}
