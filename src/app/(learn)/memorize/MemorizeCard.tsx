"use client";

import localFont from "next/font/local";
import { useTranslations } from "next-intl";
import { Volume2, RefreshCw } from "lucide-react";
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

function getBackText(card: ActionOutputCard, isReversed: boolean): string {
  if (isReversed) {
    return card.word;
  }
  return card.meanings.map((m) => m.example).filter(Boolean).join(" ");
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
          <div className="flex flex-col gap-1">
            <span className="text-gray-800">{m.definition}</span>
            {m.example && (
              <span className="border-l-2 border-primary-400/40 pl-2 text-sm italic text-gray-500">
                {m.example}
              </span>
            )}
          </div>
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
  isCardMode: boolean;
  isAudioLoading: boolean;
  onPlayText: (text: string, regenerate?: boolean) => void;
}

function PlayButton({
  label,
  disabled,
  onClick,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="inline-flex items-center justify-center rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Volume2 className="h-5 w-5" />
    </button>
  );
}

function MemorizeCard({
  card,
  showAnswer,
  isReversed,
  isDictation,
  isCardMode,
  isAudioLoading,
  onPlayText,
}: MemorizeCardProps) {
  const t = useTranslations("memorize.review");
  const displayFront = getFrontText(card, isReversed);
  const backText = getBackText(card, isReversed);
  const reveal = showAnswer || isCardMode;

  return (
    <div
      className={`mb-6 flex h-[50dvh] compact:min-h-[30dvh] compact:h-auto flex-col rounded-xl border border-gray-200 bg-white shadow-sm ${myFont.className}`}
    >
      <div className="flex-1 overflow-y-auto compact:overflow-visible">
        {isDictation ? (
          <>
            <VStack align="center" justify="center" gap={4} className="min-h-[20dvh] compact:min-h-[12dvh] p-8">
              {card.ipa && (
                <div className="text-center font-mono text-2xl text-gray-700">[{card.ipa}]</div>
              )}
              <div className="flex items-center gap-1">
                <PlayButton
                  label={t("readAloud")}
                  disabled={isAudioLoading || !displayFront}
                  onClick={() => onPlayText(displayFront)}
                />
                <button
                  type="button"
                  onClick={() => onPlayText(displayFront, true)}
                  disabled={isAudioLoading || !displayFront}
                  aria-label={t("regenerateTts")}
                  title={t("regenerateTts")}
                  className="inline-flex items-center justify-center rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </VStack>

            {reveal && (
              <>
                <div className="border-t border-gray-200" />
                <VStack
                  align="center"
                  justify="center"
                  className="min-h-[20dvh] compact:min-h-[12dvh] rounded-b-xl bg-gray-50 p-8"
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
            <VStack align="center" justify="center" className="min-h-[20dvh] compact:min-h-[12dvh] p-8" gap={2}>
              <div className="text-center text-xl whitespace-pre-line text-gray-900 md:text-2xl">
                {displayFront}
              </div>
              {!isReversed && card.ipa && (
                <div className="text-center font-mono text-lg text-gray-500">[{card.ipa}]</div>
              )}
              <div className="flex items-center gap-1">
                <PlayButton
                  label={t("readAloud")}
                  disabled={isAudioLoading || !displayFront}
                  onClick={() => onPlayText(displayFront)}
                />
                <button
                  type="button"
                  onClick={() => onPlayText(displayFront, true)}
                  disabled={isAudioLoading || !displayFront}
                  aria-label={t("regenerateTts")}
                  title={t("regenerateTts")}
                  className="inline-flex items-center justify-center rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </VStack>

            {reveal && (
              <>
                <div className="border-t border-gray-200" />
                <VStack
                  align="center"
                  justify="center"
                  className="min-h-[20dvh] compact:min-h-[12dvh] rounded-b-xl bg-gray-50 p-8"
                >
                  {getBackContent(card, isReversed)}
                  <div className="flex items-center gap-1">
                    <PlayButton
                      label={t("readAloud")}
                      disabled={isAudioLoading || !backText}
                      onClick={() => onPlayText(backText)}
                    />
                    <button
                      type="button"
                      onClick={() => onPlayText(backText, true)}
                      disabled={isAudioLoading || !backText}
                      aria-label={t("regenerateTts")}
                      title={t("regenerateTts")}
                      className="inline-flex items-center justify-center rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>
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
