"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useDictionaryStore } from "./stores/dictionaryStore";
import { PageLayout } from "@/components/ui/PageLayout";
import { LightButton } from "@/design-system/base/button";
import { Input } from "@/design-system/base/input";
import { Select } from "@/design-system/base/select";
import { Skeleton } from "@/design-system/feedback/skeleton";
import { HStack, VStack } from "@/design-system/layout/stack";
import { Plus, RefreshCw } from "lucide-react";
import { DictionaryEntry } from "./DictionaryEntry";
import { LanguageSelector } from "./LanguageSelector";
import { authClient } from "@/lib/auth-client";
import { actionGetDecksByUserId } from "@/modules/deck/deck-action";
import { actionCreateNote } from "@/modules/note/note-action";
import { actionCreateCard } from "@/modules/card/card-action";
import { actionGetNoteTypesByUserId, actionCreateDefaultBasicNoteType } from "@/modules/note-type/note-type-action";
import type { TSharedDeck } from "@/shared/anki-type";
import { toast } from "sonner";

interface DictionaryClientProps {
  initialDecks: TSharedDeck[];
}

export function DictionaryClient({ initialDecks }: DictionaryClientProps) {
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
  const [decks, setDecks] = useState<TSharedDeck[]>(initialDecks);
  const [defaultNoteTypeId, setDefaultNoteTypeId] = useState<number | null>(null);
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
      actionGetDecksByUserId(session.user.id).then((result) => {
        if (result.success && result.data) {
          setDecks(result.data as TSharedDeck[]);
        }
      });
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (session?.user?.id) {
      actionGetNoteTypesByUserId().then(async (result) => {
        if (result.success && result.data) {
          const basicNoteType = result.data.find(
            (nt) => nt.name === "Basic Vocabulary"
          );
          if (basicNoteType) {
            setDefaultNoteTypeId(basicNoteType.id);
          } else if (result.data.length > 0) {
            setDefaultNoteTypeId(result.data[0].id);
          } else {
            const createResult = await actionCreateDefaultBasicNoteType();
            if (createResult.success && createResult.data) {
              setDefaultNoteTypeId(createResult.data.id);
            }
          }
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
    if (!defaultNoteTypeId) {
      toast.error("No note type available. Please try again.");
      return;
    }
    if (!searchResult?.entries?.length) return;

    const deckSelect = document.getElementById("deck-select") as HTMLSelectElement;
    const deckId = deckSelect?.value ? Number(deckSelect.value) : decks[0]?.id;

    if (!deckId) {
      toast.error("No deck selected");
      return;
    }

    setIsSaving(true);

    const definition = searchResult.entries
      .map((e) => e.definition)
      .join(" | ");
    
    const ipa = searchResult.entries[0]?.ipa || "";
    const example = searchResult.entries
      .map((e) => e.example)
      .filter(Boolean)
      .join(" | ") || "";

    try {
      const noteResult = await actionCreateNote({
        noteTypeId: defaultNoteTypeId,
        fields: [searchResult.standardForm, definition, ipa, example],
        tags: ["dictionary"],
      });

      if (!noteResult.success || !noteResult.data) {
        toast.error(t("saveFailed"));
        setIsSaving(false);
        return;
      }

      const noteId = BigInt(noteResult.data.id);

      await actionCreateCard({
        noteId,
        deckId,
        ord: 0,
      });

      await actionCreateCard({
        noteId,
        deckId,
        ord: 1,
      });

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
        <LightButton
          type="submit"
          className="h-10 px-6 rounded-full whitespace-nowrap"
          loading={isSearching}
        >
          {t("search")}
        </LightButton>
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
                <LightButton
                  onClick={handleSave}
                  className="w-10 h-10 shrink-0"
                  title={t("saveToFolder")}
                  loading={isSaving}
                  disabled={isSaving}
                >
                  <Plus />
                </LightButton>
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
              <LightButton
                onClick={relookup}
                className="flex items-center gap-2 px-4 py-2 text-sm"
                loading={isSearching}
              >
                <RefreshCw className="w-4 h-4" />
                {t("relookup")}
              </LightButton>
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
