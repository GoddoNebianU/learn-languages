"use client";

import { useState, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { PageLayout } from "@/components/ui/PageLayout";
import { Input } from "@/design-system/input";
import { Select } from "@/design-system/select";
import { Skeleton } from "@/design-system/skeleton";
import { ClipboardPaste, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { actionLookUpDictionary } from "@/modules/dictionary/dictionary-action";
import { actionCreateCard, actionCheckCardExistsByWord } from "@/modules/card/card-action";
import type { CardType } from "@/modules/card/card-action-dto";
import type { ActionOutputDeck } from "@/modules/deck/deck-action-dto";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { getNativeName } from "@/shared/languages";
import { toast } from "sonner";

interface WordEntryClientProps {
  userId: string;
  initialDecks: ActionOutputDeck[];
}

type ProcessingState = "idle" | "looking-up" | "checking" | "saving" | "done" | "error";

interface LookupResult {
  standardForm: string;
  entries: Array<{
    ipa?: string;
    definition: string;
    partOfSpeech?: string;
    example: string;
  }>;
}

export function WordEntryClient({ userId, initialDecks }: WordEntryClientProps) {
  const t = useTranslations("word_entry");

  const [decks] = useState<ActionOutputDeck[]>(initialDecks);
  const [selectedDeckId, setSelectedDeckId] = useState<number | null>(
    initialDecks.length > 0 ? initialDecks[0].id : null
  );
  const [queryLang, setQueryLang] = useState("english");
  const [definitionLang, setDefinitionLang] = useState("chinese");
  const [inputValue, setInputValue] = useState("");
  const [processingState, setProcessingState] = useState<ProcessingState>("idle");
  const [lastResult, setLastResult] = useState<{
    word: string;
    deckName: string;
  } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const isPastingRef = useRef(false);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasDeck = selectedDeckId !== null;

  const clearTypingTimer = useCallback(() => {
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
  }, []);

  const handlePaste = useCallback(
    async (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      clearTypingTimer();
      isPastingRef.current = true;

      const pastedText = e.clipboardData.getData("text").trim();
      if (!pastedText) return;

      setInputValue(pastedText);

      if (!hasDeck) {
        toast.error(t("selectDeckFirst"));
        return;
      }

      setProcessingState("looking-up");
      setLastResult(null);

      try {
        // Step 1: Dictionary lookup
        const lookupResult = await actionLookUpDictionary({
          text: pastedText,
          queryLang: getNativeName(queryLang),
          definitionLang: getNativeName(definitionLang),
        });

        if (!lookupResult.success || !lookupResult.data) {
          toast.error(lookupResult.message || t("lookupFailed"));
          setProcessingState("error");
          return;
        }

        const lookupData: LookupResult = lookupResult.data;
        const word = lookupData.standardForm;

        // Step 2: Check if word already exists in deck
        setProcessingState("checking");
        const existsResult = await actionCheckCardExistsByWord({
          deckId: selectedDeckId!,
          word,
        });

        if (!existsResult.success) {
          toast.error(existsResult.message || t("checkFailed"));
          setProcessingState("error");
          return;
        }

        if (existsResult.data?.exists) {
          toast.error(t("wordAlreadyExists", { word }));
          setProcessingState("error");
          return;
        }

        // Step 3: Save card to deck
        setProcessingState("saving");
        const hasIpa = lookupData.entries.some((e) => e.ipa);
        const hasSpaces = lookupData.standardForm.includes(" ");
        let cardType: CardType = "WORD";
        if (!hasIpa) {
          cardType = "SENTENCE";
        } else if (hasSpaces) {
          cardType = "PHRASE";
        }

        const ipa = lookupData.entries.find((e) => e.ipa)?.ipa || null;
        const meanings = lookupData.entries.map((e) => ({
          partOfSpeech: e.partOfSpeech || null,
          definition: e.definition,
          example: e.example || null,
        }));

        const cardResult = await actionCreateCard({
          deckId: selectedDeckId!,
          word,
          ipa,
          queryLang: getNativeName(queryLang),
          cardType,
          meanings,
        });

        if (!cardResult.success) {
          toast.error(cardResult.message || t("saveFailed"));
          setProcessingState("error");
          return;
        }

        const deckName = decks.find((d) => d.id === selectedDeckId)?.name || "";
        setLastResult({ word, deckName });
        setProcessingState("done");
        toast.success(t("saved", { word, deckName }));

        setInputValue("");
      } catch {
        toast.error(t("unexpectedError"));
        setProcessingState("error");
      } finally {
        isPastingRef.current = false;
      }
    },
    [hasDeck, selectedDeckId, decks, t, clearTypingTimer, queryLang, definitionLang]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      if (isPastingRef.current) {
        return;
      }

      setInputValue(value);

      clearTypingTimer();

      typingTimerRef.current = setTimeout(() => {
        if (value.length > 0) {
          setInputValue("");
          toast.error(t("pasteOnly"));
        }
      }, 500);
    },
    [t, clearTypingTimer]
  );

  const handleFocus = useCallback(() => {
    if (processingState === "done" || processingState === "error") {
      setProcessingState("idle");
      setLastResult(null);
    }
  }, [processingState]);

  const getStatusIcon = () => {
    switch (processingState) {
      case "looking-up":
      case "checking":
      case "saving":
        return <Loader2 className="h-5 w-5 animate-spin text-primary-500" />;
      case "done":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <ClipboardPaste className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (processingState) {
      case "looking-up":
        return t("lookingUp");
      case "checking":
        return t("checkingDuplicate");
      case "saving":
        return t("saving");
      case "done":
        return lastResult ? t("savedStatus", { word: lastResult.word, deckName: lastResult.deckName }) : t("saved");
      case "error":
        return t("error");
      default:
        return t("hint");
    }
  };

  const isProcessing = processingState === "looking-up" || processingState === "checking" || processingState === "saving";

  return (
    <PageLayout>
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-800 md:text-5xl">{t("title")}</h1>
        <p className="text-lg text-gray-700">{t("description")}</p>
      </div>

      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-gray-800">{t("targetDeck")}</label>
        <Select
          value={selectedDeckId ?? ""}
          onChange={(e) => setSelectedDeckId(Number(e.target.value))}
          className="w-full"
          disabled={isProcessing}
        >
          {decks.length === 0 ? (
            <option value="">{t("noDecks")}</option>
          ) : (
            decks.map((deck) => (
              <option key={deck.id} value={deck.id}>
                {deck.name}
              </option>
            ))
          )}
        </Select>
      </div>

      <div className="mb-6 rounded-lg bg-white/20 p-4">
        <div className="mb-3">
          <span className="font-semibold text-gray-800">{t("languageSettings")}</span>
        </div>

        <div className="space-y-4">
          <LanguageSelector
            label={t("queryLanguage")}
            hint={t("queryLanguageHint")}
            value={queryLang}
            onChange={setQueryLang}
            otherLabel={t("other")}
            otherPlaceholder={t("otherLanguagePlaceholder")}
          />

          <LanguageSelector
            label={t("definitionLanguage")}
            hint={t("definitionLanguageHint")}
            value={definitionLang}
            onChange={setDefinitionLang}
            otherLabel={t("other")}
            otherPlaceholder={t("otherLanguagePlaceholder")}
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-gray-800">{t("wordInput")}</label>
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleChange}
          onPaste={handlePaste}
          onFocus={handleFocus}
          placeholder={hasDeck ? t("pastePlaceholder") : t("selectDeckFirst")}
          className="w-full text-lg"
          disabled={!hasDeck || isProcessing}
          rightIcon={getStatusIcon()}
          containerClassName="w-full"
        />
      </div>

      <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
        {isProcessing && <Skeleton variant="text" className="h-4 w-32" />}
        {!isProcessing && <span>{getStatusText()}</span>}
      </div>
    </PageLayout>
  );
}
