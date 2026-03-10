"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Layers } from "lucide-react";
import type { ActionOutputDeck } from "@/modules/deck/deck-action-dto";
import type { ActionOutputCardStats } from "@/modules/card/card-action-dto";
import { PageLayout } from "@/components/ui/PageLayout";
import { PrimaryButton } from "@/design-system/base/button";

interface DeckWithStats extends ActionOutputDeck {
  stats?: ActionOutputCardStats;
}

interface DeckSelectorProps {
  decks: ActionOutputDeck[];
  deckStats: Map<number, ActionOutputCardStats | undefined>;
}

const DeckSelector: React.FC<DeckSelectorProps> = ({ decks, deckStats }) => {
  const t = useTranslations("memorize.deck_selector");
  const router = useRouter();

  const formatCardStats = (stats: ActionOutputCardStats | undefined): string => {
    if (!stats) return t("noCards");
    const parts: string[] = [];
    if (stats.new > 0) parts.push(`${t("new")}: ${stats.new}`);
    if (stats.learning > 0) parts.push(`${t("learning")}: ${stats.learning}`);
    if (stats.review > 0) parts.push(`${t("review")}: ${stats.review}`);
    if (stats.due > 0) parts.push(`${t("due")}: ${stats.due}`);
    return parts.length > 0 ? parts.join(" • ") : t("noCards");
  };

  const getDueCount = (deckId: number): number => {
    const stats = deckStats.get(deckId);
    return stats?.due ?? 0;
  };

  return (
    <PageLayout>
      {decks.length === 0 ? (
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            {t("noDecks")}
          </h1>
          <Link href="/decks">
            <PrimaryButton className="px-6 py-2">
              {t("goToDecks")}
            </PrimaryButton>
          </Link>
        </div>
      ) : (
        <>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
            {t("selectDeck")}
          </h1>
          <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
            {decks
              .toSorted((a, b) => a.id - b.id)
              .map((deck) => {
                const stats = deckStats.get(deck.id);
                const dueCount = getDueCount(deck.id);
                
                return (
                  <div
                    key={deck.id}
                    onClick={() =>
                      router.push(`/memorize?deck_id=${deck.id}`)
                    }
                    className="flex flex-row items-center p-4 gap-3 hover:cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    <div className="shrink-0">
                      <Layers className="text-gray-600 w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {deck.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatCardStats(stats)}
                      </div>
                    </div>
                    {dueCount > 0 && (
                      <div className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {dueCount}
                      </div>
                    )}
                    <div className="text-gray-400">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                );
              })}
          </div>
        </>
      )}
    </PageLayout>
  );
};

export { DeckSelector };
