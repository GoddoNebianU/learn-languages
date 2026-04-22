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
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          {t("title")}
        </h1>
        <p className="text-gray-700 text-lg">
          {t("description")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
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
          className="px-6 rounded-full whitespace-nowrap"
          loading={isSearching}
        >
          {t("search")}
        </Button>
      </form>

      <div className="mt-4 bg-white/20 rounded-lg p-4">
        <div className="mb-3">
          <span className="text-gray-800 font-semibold">{t("languageSettings")}</span>
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
            <Skeleton variant="circular" className="w-8 h-8 mb-3" />
            <p className="text-gray-600">{t("searching")}</p>
          </VStack>
        ) : query && !searchResult ? (
          <div className="text-center py-12 bg-white/20 rounded-lg">
            <p className="text-gray-800 text-xl">{t("noResults")}</p>
            <p className="text-gray-600 mt-2">{t("tryOtherWords")}</p>
          </div>
        ) : searchResult ? (
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  {searchResult.standardForm}
                </h2>
              </div>
              <HStack align="center" gap={2} className="ml-4">
                {session && decks.length > 0 && (
                  <Select
                    id="deck-select"
                    variant="bordered"
                    size="sm"
                  >
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

            <div className="border-t border-gray-200 pt-4 mt-4">
              <Button
                variant="light"
                onClick={relookup}
                className="text-sm"
                loading={isSearching}
              >
                <RefreshCw className="w-4 h-4" />
                {t("relookup")}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-gray-800 text-xl mb-2">{t("welcomeTitle")}</p>
            <p className="text-gray-600">{t("welcomeHint")}</p>
          </div>
        )}
      </div>
    </PageLayout>
  );
}

export function DictionaryClient({ initialDecks }: DictionaryClientProps) {
  return (
    <Suspense fallback={<PageLayout><div className="flex min-h-[50vh] items-center justify-center"><p>Loading...</p></div></PageLayout>}>
      <DictionaryClientInner initialDecks={initialDecks} />
    </Suspense>
  );
}
