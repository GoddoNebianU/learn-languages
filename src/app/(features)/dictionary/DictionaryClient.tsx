"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useDictionaryStore } from "./stores/dictionaryStore";
import { PageLayout } from "@/components/ui/PageLayout";
import { LightButton } from "@/design-system/base/button";
import { Input } from "@/design-system/base/input";
import { Plus, RefreshCw } from "lucide-react";
import { DictionaryEntry } from "./DictionaryEntry";
import { LanguageSelector } from "./LanguageSelector";
import { authClient } from "@/lib/auth-client";
import { actionGetFoldersByUserId, actionCreatePair } from "@/modules/folder/folder-action";
import { TSharedFolder } from "@/shared/folder-type";
import { toast } from "sonner";

interface DictionaryClientProps {
  initialFolders: TSharedFolder[];
}

export function DictionaryClient({ initialFolders }: DictionaryClientProps) {
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
  const [folders, setFolders] = useState<TSharedFolder[]>(initialFolders);

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
      actionGetFoldersByUserId(session.user.id).then((result) => {
        if (result.success && result.data) {
          setFolders(result.data);
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
      toast.error("Please login first");
      return;
    }
    if (folders.length === 0) {
      toast.error("Please create a folder first");
      return;
    }

    const folderSelect = document.getElementById("folder-select") as HTMLSelectElement;
    const folderId = folderSelect?.value ? Number(folderSelect.value) : folders[0]?.id;

    if (!searchResult?.entries?.length) return;

    const definition = searchResult.entries
      .map((e) => e.definition)
      .join(" | ");

    try {
      await actionCreatePair({
        text1: searchResult.standardForm,
        text2: definition,
        language1: queryLang,
        language2: definitionLang,
        ipa1: searchResult.entries[0]?.ipa,
        folderId: folderId,
      });

      const folderName = folders.find((f) => f.id === folderId)?.name || "Unknown";
      toast.success(`Saved to ${folderName}`);
    } catch (error) {
      toast.error("Save failed");
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
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-600">{t("searching")}</p>
          </div>
        ) : query && !searchResult ? (
          <div className="text-center py-12 bg-white/20 rounded-lg">
            <p className="text-gray-800 text-xl">No results found</p>
            <p className="text-gray-600 mt-2">Try other words</p>
          </div>
        ) : searchResult ? (
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  {searchResult.standardForm}
                </h2>
              </div>
              <div className="flex items-center gap-2 ml-4">
                {session && folders.length > 0 && (
                  <select
                    id="folder-select"
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#35786f]"
                  >
                    {folders.map((folder) => (
                      <option key={folder.id} value={folder.id}>
                        {folder.name}
                      </option>
                    ))}
                  </select>
                )}
                <LightButton
                  onClick={handleSave}
                  className="w-10 h-10 shrink-0"
                  title="Save to folder"
                >
                  <Plus />
                </LightButton>
              </div>
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
                Re-lookup
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
