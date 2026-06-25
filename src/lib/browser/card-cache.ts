import { create } from "zustand";
import type { ActionOutputCard } from "@/modules/card/card-action-dto";

interface CardCacheEntry {
  hash: string;
  cards: ActionOutputCard[];
}

interface CardCacheState {
  entries: Record<string, CardCacheEntry>;
  get: (deckId: number, includeHidden: boolean) => CardCacheEntry | undefined;
  set: (deckId: number, includeHidden: boolean, hash: string, cards: ActionOutputCard[]) => void;
  invalidate: (deckId: number) => void;
}

const key = (deckId: number, includeHidden: boolean) => `${deckId}:${includeHidden}`;

export const useCardCache = create<CardCacheState>((set, get) => ({
  entries: {},
  get: (deckId, includeHidden) => get().entries[key(deckId, includeHidden)],
  set: (deckId, includeHidden, hash, cards) =>
    set((state) => ({
      entries: { ...state.entries, [key(deckId, includeHidden)]: { hash, cards } },
    })),
  invalidate: (deckId) =>
    set((state) => {
      const entries = { ...state.entries };
      for (const k of Object.keys(entries)) {
        if (k.startsWith(`${deckId}:`)) delete entries[k];
      }
      return { entries };
    }),
}));
