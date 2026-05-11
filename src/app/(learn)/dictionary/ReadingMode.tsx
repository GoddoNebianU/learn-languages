"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { DictionaryEntry } from "./DictionaryEntry";
import { actionLookUpDictionary } from "@/modules/dictionary/dictionary-action";
import { actionGetCardByWord, actionCreateCard, actionUpdateCard, actionDeleteCard } from "@/modules/card/card-action";
import type { ActionOutputDeck } from "@/modules/deck/deck-action-dto";
import type { CardType } from "@/modules/card/card-action-dto";
import type { TSharedItem } from "@/shared/dictionary-type";
import { Input } from "@/design-system/input";
import { Button } from "@/design-system/button";
import { IconButton } from "@/design-system/icon-button";
import { Select } from "@/design-system/select";
import { Skeleton } from "@/design-system/skeleton";
import { HStack } from "@/design-system/stack";
import { RefreshCw, Trash2, ClipboardPaste, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getNativeName } from "@/shared/languages";

interface ReadingModeProps {
  queryLang: string;
  definitionLang: string;
  decks: ActionOutputDeck[];
  isLoggedIn: boolean;
}

type ProcessingState = "idle" | "looking-up" | "saving" | "done" | "error";

export function ReadingMode({ queryLang, definitionLang, decks, isLoggedIn }: ReadingModeProps) {
  const t = useTranslations("dictionary");

  const [selectedDeckId, setSelectedDeckId] = useState<number | null>(
    decks.length > 0 ? decks[0].id : null
  );
  const [inputValue, setInputValue] = useState("");
  const [processingState, setProcessingState] = useState<ProcessingState>("idle");
  const [lastResult, setLastResult] = useState<{ word: string; deckName: string } | null>(null);
  const [readingSearchResult, setReadingSearchResult] = useState<TSharedItem | null>(null);
  const [currentCardId, setCurrentCardId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isRequerying, setIsRequerying] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const prevLengthRef = useRef(0);

  const hasDeck = selectedDeckId !== null;
  const isProcessing =
    processingState === "looking-up" || processingState === "saving";

  useEffect(() => {
    if (readingSearchResult) {
      inputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [readingSearchResult]);

  const handleReadingChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      const prevLength = prevLengthRef.current;
      const newLength = newValue.length;

      if (prevLength === 0 && newLength >= 2) {
        prevLengthRef.current = newLength;
        setInputValue(newValue);

        if (!hasDeck) {
          toast.error(t("selectDeckFirst"));
          prevLengthRef.current = 0;
          setInputValue("");
          return;
        }

        setProcessingState("looking-up");
        setLastResult(null);
        setReadingSearchResult(null);
        setCurrentCardId(null);

        try {
          const existingCard = await actionGetCardByWord({
            deckId: selectedDeckId!,
            word: newValue.trim(),
          });

          if (existingCard.success && existingCard.data) {
            const card = existingCard.data;
            const cachedResult: TSharedItem = {
              standardForm: card.word,
              entries: card.meanings.map((m) => ({
                ipa: card.ipa ?? undefined,
                definition: m.definition,
                partOfSpeech: m.partOfSpeech ?? undefined,
                example: m.example ?? "",
              })),
            };
            setReadingSearchResult(cachedResult);
            setCurrentCardId(card.id);
            toast.info(t("wordAlreadyExists", { word: card.word }));
            setProcessingState("done");
            prevLengthRef.current = 0;
            setInputValue("");
            return;
          }

          const lookupResult = await actionLookUpDictionary({
            text: newValue.trim(),
            queryLang: getNativeName(queryLang),
            definitionLang: getNativeName(definitionLang),
            deckId: selectedDeckId!,
          });

          if (!lookupResult.success || !lookupResult.data) {
            toast.error(lookupResult.message || t("lookupFailed"));
            setProcessingState("error");
            prevLengthRef.current = 0;
            setInputValue("");
            return;
          }

          const lookupData = lookupResult.data;
          setReadingSearchResult(lookupData);

          if (lookupData.alreadyExists) {
            const existingByForm = await actionGetCardByWord({
              deckId: selectedDeckId!,
              word: lookupData.standardForm,
            });
            if (existingByForm.success && existingByForm.data) {
              setCurrentCardId(existingByForm.data.id);
            }
            toast.info(t("wordAlreadyExists", { word: lookupData.standardForm }));
            setProcessingState("done");
            prevLengthRef.current = 0;
            setInputValue("");
            return;
          }

          const word = lookupData.standardForm;

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
            prevLengthRef.current = 0;
            setInputValue("");
            return;
          }

          setCurrentCardId(cardResult.cardId ?? null);

          const deckName = decks.find((d) => d.id === selectedDeckId)?.name || "";
          setLastResult({ word, deckName });
          setProcessingState("done");
          toast.success(t("savedStatus", { word, deckName }));
        } catch {
          toast.error(t("unexpectedError"));
          setProcessingState("error");
        } finally {
          prevLengthRef.current = 0;
          setInputValue("");
        }
      } else {
        setInputValue("");
        prevLengthRef.current = 0;
        if (newLength > 0) {
          toast.error(t("pasteOnly"));
        }
      }
    },
    [hasDeck, selectedDeckId, decks, t, queryLang, definitionLang]
  );

  const getStatusIcon = () => {
    switch (processingState) {
      case "looking-up":
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
      case "saving":
        return t("saving");
      case "done":
        return lastResult ? t("savedStatus", { word: lastResult.word, deckName: lastResult.deckName }) : "";
      case "error":
        return t("saveFailed");
      default:
        return t("pasteHint");
    }
  };

  const handleRequery = async () => {
    if (!readingSearchResult || !currentCardId) return;

    setIsRequerying(true);
    try {
      const result = await actionLookUpDictionary({
        text: readingSearchResult.standardForm,
        queryLang: getNativeName(queryLang),
        definitionLang: getNativeName(definitionLang),
      });

      if (!result.success || !result.data) {
        toast.error(result.message || t("relookupFailed"));
        return;
      }

      const newResult = result.data;
      const hasIpa = newResult.entries.some((e) => e.ipa);
      const hasSpaces = newResult.standardForm.includes(" ");
      let cardType: CardType = "WORD";
      if (!hasIpa) cardType = "SENTENCE";
      else if (hasSpaces) cardType = "PHRASE";

      const ipa = newResult.entries.find((e) => e.ipa)?.ipa || null;
      const meanings = newResult.entries.map((e) => ({
        partOfSpeech: e.partOfSpeech || null,
        definition: e.definition,
        example: e.example || null,
      }));

      const updateResult = await actionUpdateCard({
        cardId: currentCardId,
        word: newResult.standardForm,
        ipa,
        meanings,
      });

      if (!updateResult.success) {
        toast.error(updateResult.message || t("relookupFailed"));
        return;
      }

      setReadingSearchResult(newResult);
      toast.success(t("relookupSuccess"));
    } catch {
      toast.error(t("relookupFailed"));
    } finally {
      setIsRequerying(false);
    }
  };

  const handleDeleteCard = async () => {
    if (!currentCardId) return;
    try {
      const result = await actionDeleteCard({ cardId: currentCardId });
      if (result.success) {
        toast.success(t("deleteCardSuccess"));
        setReadingSearchResult(null);
        setCurrentCardId(null);
        setProcessingState("idle");
        setLastResult(null);
      } else {
        toast.error(result.message || t("deleteCardFailed"));
      }
    } catch {
      toast.error(t("deleteCardFailed"));
    }
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <div className="mb-4">
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

      <div className="mb-4">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleReadingChange}
          placeholder={hasDeck ? t("pastePlaceholder") : t("selectDeckFirst")}
          className="w-full text-lg"
          disabled={!hasDeck || isProcessing}
          rightIcon={getStatusIcon()}
          containerClassName="w-full"
        />
      </div>

      <div className="mb-6 flex items-start justify-center gap-2 text-sm text-gray-600">
        {isProcessing && <Skeleton variant="text" className="h-4 w-32" />}
        {!isProcessing && !readingSearchResult && <span>{getStatusText()}</span>}
      </div>

      {readingSearchResult ? (
        <div className="rounded-lg bg-white p-6 shadow-lg min-h-[calc(100vh-14rem)]">
          <div className="mb-6 flex items-start justify-between">
            <div className="flex-1">
              <h2 className="mb-2 text-3xl font-bold text-gray-800">
                {readingSearchResult.standardForm}
              </h2>
            </div>
            {currentCardId && (
              <HStack align="center" gap={2} className="ml-4">
                <IconButton
                  onClick={handleRequery}
                  disabled={isRequerying}
                  title={t("relookup")}
                  className="rounded-full text-gray-400 hover:bg-blue-50 hover:text-blue-500"
                >
                  <RefreshCw className={isRequerying ? "animate-spin" : ""} size={18} />
                </IconButton>
                <IconButton
                  onClick={() => setShowDeleteConfirm(true)}
                  title={t("deleteCard")}
                  className="rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 size={18} />
                </IconButton>
              </HStack>
            )}
          </div>

          <div className="space-y-6">
            {readingSearchResult.entries.map((entry, index) => (
              <div key={index} className="border-t border-gray-200 pt-4">
                <DictionaryEntry entry={entry} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="min-h-[calc(100vh-14rem)]" />
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 max-w-sm rounded-lg bg-white p-4">
            <p className="mb-4 text-gray-700">{t("deleteCardConfirm")}</p>
            <div className="flex justify-end gap-2">
              <Button variant="light" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                {t("cancel")}
              </Button>
              <Button variant="light" size="sm" onClick={handleDeleteCard}>
                {t("deleteCard")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
