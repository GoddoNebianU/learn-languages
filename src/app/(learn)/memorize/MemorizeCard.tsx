"use client";

import localFont from "next/font/local";
import { useTranslations } from "next-intl";
import { VStack } from "@/design-system/stack";
import type { ActionOutputCard } from "@/modules/card/card-action-dto";

const myFont = localFont({
  src: "../../../../public/fonts/NotoNaskhArabic-VariableFont_wght.ttf",
});

function getFrontText(card: ActionOutputCard, isReversed: boolean): string {
  if (isReversed) {
    return card.meanings
      .map((m) => (m.partOfSpeech ? `${m.partOfSpeech}: ${m.definition}` : m.definition))
      .join("; ");
  }
  return card.word;
}

function getBackContent(card: ActionOutputCard, isReversed: boolean): React.ReactNode {
  if (isReversed) {
    return (
      <VStack align="center" gap={1}>
        <span className="text-center text-xl text-gray-900 md:text-2xl">{card.word}</span>
        {card.ipa && (
          <span className="text-center font-mono text-lg text-gray-500">[{card.ipa}]</span>
        )}
      </VStack>
    );
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
}

interface MemorizeCardProps {
  card: ActionOutputCard;
  showAnswer: boolean;
  isReversed: boolean;
  isDictation: boolean;
}

function MemorizeCard({ card, showAnswer, isReversed, isDictation }: MemorizeCardProps) {
  const t = useTranslations("memorize.review");
  const displayFront = getFrontText(card, isReversed);

  return (
    <div
      className={`mb-6 flex h-[50dvh] flex-col rounded-xl border border-gray-200 bg-white shadow-sm ${myFont.className}`}
    >
      <div className="flex-1 overflow-y-auto">
        {isDictation ? (
          <>
            <VStack align="center" justify="center" gap={4} className="min-h-[20dvh] p-8">
              {card.ipa ? (
                <div className="text-center font-mono text-2xl text-gray-700">
                  [{card.ipa}]
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
                  {getBackContent(card, isReversed)}
                </VStack>
              </>
            )}
          </>
        ) : (
          <>
            <VStack align="center" justify="center" className="min-h-[20dvh] p-8" gap={2}>
              <div className="text-center text-xl whitespace-pre-line text-gray-900 md:text-2xl">
                {displayFront}
              </div>
              {!isReversed && card.ipa && (
                <div className="text-center font-mono text-lg text-gray-500">
                  [{card.ipa}]
                </div>
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
                  {getBackContent(card, isReversed)}
                </VStack>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export { MemorizeCard };
