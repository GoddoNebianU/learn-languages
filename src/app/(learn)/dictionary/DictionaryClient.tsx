"use client";

import { Suspense, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useDictionaryStore } from "./stores/dictionaryStore";
import { PageLayout } from "@/components/ui/PageLayout";
import { Button } from "@/design-system/button";
import { Input } from "@/design-system/input";
import { Select } from "@/design-system/select";
import { Skeleton } from "@/design-system/skeleton";
import { HStack, VStack } from "@/design-system/stack";
import { Plus, RefreshCw } from "lucide-react";
import { DictionaryEntry } from "./DictionaryEntry";
import { LanguageSelector } from "./LanguageSelector";
import { authClient } from "@/lib/auth-client";
import { actionGetDecksByUserId } from "@/modules/deck/deck-action";
import { actionCreateCard } from "@/modules/card/card-action";
import type { ActionOutputDeck } from "@/modules/deck/deck-action-dto";
import type { CardType } from "@/modules/card/card-action-dto";
import { toast } from "sonner";
import { getNativeName } from "./stores/dictionaryStore";

interface DictionaryClientProps {
  initialDecks: ActionOutputDeck[];
}

function DictionaryClientInner({ initialDecks }: DictionaryClientProps) {
  const t = useTranslations("dictionary");
  const router = useRouter();
  const searchParams = useSearchParams();

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

  useEffect(() => {
    const q = searchParams.get("q") || undefined;
    const ql = searchParams.get("ql") || undefined;
    const dl = searchParams.get("dl") || undefined;

    syncFromUrl({ q, ql, dl });

    if (q) {
      search();
    }
  }, [searchParams, syncFromUrl, search]);

  useEffect(() => {
    if (session?.user?.id) {
      actionGetDecksByUserId({ userId: session.user.id }).then((result) => {
        if (result.success && result.data) {
          setDecks(result.data);
        }
      });
    }
  }, [session?.user?.id]);

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
      console.error("Save error:", error);
      toast.error(t("saveFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageLayout>
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-800 md:text-5xl">{t("title")}</h1>
        <p className="text-lg text-gray-700">{t("description")}</p>
      </div>

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

      <div className="mt-4 rounded-lg bg-white/20 p-4">
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
