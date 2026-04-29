"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { TSharedItem } from "@/shared/dictionary-type";
import { actionLookUpDictionary } from "@/modules/dictionary/dictionary-action";
import { toast } from "sonner";
import { getNativeName } from "@/shared/languages";

export { getNativeName };

export interface DictionaryState {
  query: string;
  queryLang: string;
  definitionLang: string;
  searchResult: TSharedItem | null;
  isSearching: boolean;
}

export interface DictionaryActions {
  setQuery: (query: string) => void;
  setQueryLang: (lang: string) => void;
  setDefinitionLang: (lang: string) => void;
  setSearchResult: (result: TSharedItem | null) => void;
  search: () => Promise<void>;
  relookup: () => Promise<void>;
  syncFromUrl: (params: { q?: string; ql?: string; dl?: string }) => void;
}

export type DictionaryStore = DictionaryState & DictionaryActions;

const initialState: DictionaryState = {
  query: "",
  queryLang: "english",
  definitionLang: "chinese",
  searchResult: null,
  isSearching: false,
};

export const useDictionaryStore = create<DictionaryStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setQuery: (query) => set({ query }),

      setQueryLang: (queryLang) => set({ queryLang }),

      setDefinitionLang: (definitionLang) => set({ definitionLang }),

      setSearchResult: (searchResult) => set({ searchResult }),

      search: async () => {
        const { query, queryLang, definitionLang } = get();

        if (!query.trim()) {
          return;
        }

        set({ isSearching: true });

        try {
          const result = await actionLookUpDictionary({
            text: query,
            queryLang: getNativeName(queryLang),
            definitionLang: getNativeName(definitionLang),
            forceRelook: false,
          });

          if (result.success && result.data) {
            set({ searchResult: result.data });
          } else {
            set({ searchResult: null });
            if (result.message) {
              toast.error(result.message);
            }
          }
        } catch (error) {
          set({ searchResult: null });
          toast.error("Search failed");
        } finally {
          set({ isSearching: false });
        }
      },

      relookup: async () => {
        const { query, queryLang, definitionLang } = get();

        if (!query.trim()) {
          return;
        }

        set({ isSearching: true });

        try {
          const result = await actionLookUpDictionary({
            text: query,
            queryLang: getNativeName(queryLang),
            definitionLang: getNativeName(definitionLang),
            forceRelook: true,
          });

          if (result.success && result.data) {
            set({ searchResult: result.data });
            toast.success("Re-lookup successful");
          } else {
            if (result.message) {
              toast.error(result.message);
            }
          }
        } catch (error) {
          toast.error("Re-lookup failed");
        } finally {
          set({ isSearching: false });
        }
      },

      syncFromUrl: (params) => {
        const updates: Partial<DictionaryState> = {};

        if (params.q !== undefined) {
          updates.query = params.q;
        }
        if (params.ql !== undefined) {
          updates.queryLang = params.ql;
        }
        if (params.dl !== undefined) {
          updates.definitionLang = params.dl;
        }

        if (Object.keys(updates).length > 0) {
          set(updates);
        }
      },
    }),
    { name: "dictionary-store" }
  )
);
