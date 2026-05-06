"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useDictionaryStore } from "./stores/dictionaryStore";
import { PageLayout } from "@/components/ui/PageLayout";
import { Button } from "@/design-system/button";
import { IconButton } from "@/design-system/icon-button";
import { Input } from "@/design-system/input";
import { Select } from "@/design-system/select";
import { Skeleton } from "@/design-system/skeleton";
import { HStack, VStack } from "@/design-system/stack";
import { Plus, RefreshCw, Trash2, ClipboardPaste, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { DictionaryEntry } from "./DictionaryEntry";
import { LanguageSelector } from "./LanguageSelector";
import { authClient } from "@/lib/auth-client";
import { actionGetDecksByUserId } from "@/modules/deck/deck-action";
import { actionCreateCard, actionGetCardByWord, actionUpdateCard, actionDeleteCard } from "@/modules/card/card-action";
import type { ActionOutputDeck } from "@/modules/deck/deck-action-dto";
import type { CardType } from "@/modules/card/card-action-dto";
import { actionLookUpDictionary } from "@/modules/dictionary/dictionary-action";
import { toast } from "sonner";
import { getNativeName } from "@/shared/languages";
import type { TSharedItem } from "@/shared/dictionary-type";

interface DictionaryClientProps {
  initialDecks: ActionOutputDeck[];
}

type ProcessingState = "idle" | "looking-up" | "saving" | "done" | "error";

function DictionaryClientInner({ initialDecks }: DictionaryClientProps) {
  const t = useTranslations("dictionary");
  const router = useRouter();
  const searchParams = useSearchParams();

  const isReadingMode = searchParams.get("mode") === "reading";

  const {
    query,
    queryLang,
    definitionLang,
    searchResult,
    isSearching,
    setQuery,
    setQueryLang,
    setDefinitionLang,
    search,
    relookup,
    syncFromUrl,
  } = useDictionaryStore();

  const { data: session } = authClient.useSession();
  const [decks, setDecks] = useState<ActionOutputDeck[]>(initialDecks);
  const [isSaving, setIsSaving] = useState(false);

  const [selectedDeckId, setSelectedDeckId] = useState<number | null>(
    initialDecks.length > 0 ? initialDecks[0].id : null
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
    if (session?.user?.id) {
      actionGetDecksByUserId({ userId: session.user.id }).then((result) => {
        if (result.success && result.data) {
          setDecks(result.data);
        }
      });
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (readingSearchResult && isReadingMode) {
      inputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [readingSearchResult, isReadingMode]);

  useEffect(() => {
    if (isReadingMode) return;

    const q = searchParams.get("q") || undefined;
    const ql = searchParams.get("ql") || undefined;
    const dl = searchParams.get("dl") || undefined;

    syncFromUrl({ q, ql, dl });

    if (q) {
      search();
    }
  }, [searchParams, syncFromUrl, search, isReadingMode]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!query.trim()) return;

    const params = new URLSearchParams({
      q: query,
      ql: queryLang,
      dl: definitionLang,
    });

    router.push(`/dictionary?${params.toString()}`);
  };

  const handleSave = async () => {
    if (!session) {
      toast.error(t("pleaseLogin"));
      return;
    }
    if (decks.length === 0) {
      toast.error(t("pleaseCreateFolder"));
      return;
    }
    if (!searchResult?.entries?.length) {
      toast.error(t("noDictionaryItemToSave"));
      return;
    }

    const deckSelect = document.getElementById("deck-select") as HTMLSelectElement;
    const deckId = deckSelect?.value ? Number(deckSelect.value) : decks[0]?.id;

    if (!deckId) {
      toast.error(t("noDeckSelected"));
      return;
    }

    setIsSaving(true);

    try {
      const hasIpa = searchResult.entries.some((e) => e.ipa);
      const hasSpaces = searchResult.standardForm.includes(" ");
      let cardType: CardType = "WORD";
      if (!hasIpa) {
        cardType = "SENTENCE";
      } else if (hasSpaces) {
        cardType = "PHRASE";
      }

      const ipa = searchResult.entries.find((e) => e.ipa)?.ipa || null;
      const meanings = searchResult.entries.map((e) => ({
        partOfSpeech: e.partOfSpeech || null,
        definition: e.definition,
        example: e.example || null,
      }));

      const cardResult = await actionCreateCard({
        deckId,
        word: searchResult.standardForm,
        ipa,
        queryLang: getNativeName(queryLang),
        cardType,
        meanings,
      });

      if (!cardResult.success) {
        toast.error(cardResult.message || t("saveFailed"));
        setIsSaving(false);
        return;
      }

      const deckName = decks.find((d) => d.id === deckId)?.name || "Unknown";
      toast.success(t("savedToFolder", { folderName: deckName }));
    } catch (error) {
      toast.error(t("saveFailed"));
    } finally {
      setIsSaving(false);
    }
  };

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
            // Card found by standardForm via orchestrator — retrieve the card ID
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

  const handleModeToggle = (mode: "normal" | "reading") => {
    if (mode === "reading") {
      router.push("/dictionary?mode=reading");
    } else {
      router.push("/dictionary");
    }
  };

  return (
    <PageLayout>
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-800 md:text-5xl">{t("title")}</h1>
        <p className="text-lg text-gray-700">{t("description")}</p>
      </div>

      {/* Mode Toggle */}
      <div className="mb-6 flex justify-center">
        <HStack align="center" gap={2}>
          <Button
            variant={isReadingMode ? "light" : "primary"}
            onClick={() => handleModeToggle("normal")}
            size="sm"
          >
            {t("normalMode")}
          </Button>
          <Button
            variant={isReadingMode ? "primary" : "light"}
            onClick={() => handleModeToggle("reading")}
            size="sm"
          >
            {t("readingMode")}
          </Button>
        </HStack>
      </div>

      {/* Shared Language Settings */}
      <div className="mb-4 rounded-lg bg-white/20 p-4">
        <div className="mb-3">
          <span className="font-semibold text-gray-800">{t("languageSettings")}</span>
        </div>

        <div className="space-y-4">
          <LanguageSelector
            label={t("queryLanguage")}
            hint={t("queryLanguageHint")}
            value={queryLang}
            onChange={setQueryLang}
          />

          <LanguageSelector
            label={t("definitionLanguage")}
            hint={t("definitionLanguageHint")}
            value={definitionLang}
            onChange={setDefinitionLang}
          />
        </div>
      </div>

      {isReadingMode ? (
        /* ===== READING MODE ===== */
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
      ) : (
        /* ===== NORMAL MODE ===== */
        <>
          <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
            <Input
              type="text"
              name="searchQuery"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              variant="search"
              required
              containerClassName="flex-1"
            />
            <Button
              variant="light"
              type="submit"
              className="rounded-full px-6 whitespace-nowrap"
              loading={isSearching}
            >
              {t("search")}
            </Button>
          </form>

          <div className="mt-8">
            {isSearching ? (
              <VStack align="center" className="py-12">
                <Skeleton variant="circular" className="mb-3 h-8 w-8" />
                <p className="text-gray-600">{t("searching")}</p>
              </VStack>
            ) : query && !searchResult ? (
              <div className="rounded-lg bg-white/20 py-12 text-center">
                <p className="text-xl text-gray-800">{t("noResults")}</p>
                <p className="mt-2 text-gray-600">{t("tryOtherWords")}</p>
              </div>
            ) : searchResult ? (
              <div className="rounded-lg bg-white p-6 shadow-lg">
                <div className="mb-6 flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="mb-2 text-3xl font-bold text-gray-800">
                      {searchResult.standardForm}
                    </h2>
                  </div>
                  <HStack align="center" gap={2} className="ml-4">
                    {session && decks.length > 0 && (
                      <Select id="deck-select" variant="bordered" size="sm">
                        {decks.map((deck) => (
                          <option key={deck.id} value={deck.id}>
                            {deck.name}
                          </option>
                        ))}
                      </Select>
                    )}
                    <Button
                      variant="light"
                      onClick={handleSave}
                      className="w-10 shrink-0"
                      title={t("saveToFolder")}
                      loading={isSaving}
                      disabled={isSaving}
                    >
                      <Plus />
                    </Button>
                  </HStack>
                </div>

                <div className="space-y-6">
                  {searchResult.entries.map((entry, index) => (
                    <div key={index} className="border-t border-gray-200 pt-4">
                      <DictionaryEntry entry={entry} />
                    </div>
                  ))}
                </div>

                <div className="mt-4 border-t border-gray-200 pt-4">
                  <Button variant="light" onClick={relookup} className="text-sm" loading={isSearching}>
                    <RefreshCw className="h-4 w-4" />
                    {t("relookup")}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="mb-2 text-xl text-gray-800">{t("welcomeTitle")}</p>
                <p className="text-gray-600">{t("welcomeHint")}</p>
              </div>
            )}
          </div>
        </>
      )}
    </PageLayout>
  );
}

export function DictionaryClient({ initialDecks }: DictionaryClientProps) {
  return (
    <Suspense
      fallback={
        <PageLayout>
          <div className="flex min-h-[50vh] items-center justify-center">
            <p>Loading...</p>
          </div>
        </PageLayout>
      }
    >
      <DictionaryClientInner initialDecks={initialDecks} />
    </Suspense>
  );
}
