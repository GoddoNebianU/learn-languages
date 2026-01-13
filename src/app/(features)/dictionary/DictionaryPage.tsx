"use client";

import { useState, useEffect } from "react";
import Container from "@/components/ui/Container";
import { authClient } from "@/lib/auth-client";
import { Folder } from "../../../../generated/prisma/browser";
import { getFoldersByUserId } from "@/lib/server/services/folderService";
import { DictLookUpResponse } from "./types";
import { SearchForm } from "./SearchForm";
import { SearchResult } from "./SearchResult";
import { useTranslations } from "next-intl";
import { POPULAR_LANGUAGES } from "./constants";
import { performDictionaryLookup } from "./utils";

export default function Dictionary() {
    const t = useTranslations("dictionary");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResult, setSearchResult] = useState<DictLookUpResponse | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [queryLang, setQueryLang] = useState("english");
    const [definitionLang, setDefinitionLang] = useState("chinese");
    const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
    const [folders, setFolders] = useState<Folder[]>([]);
    const { data: session } = authClient.useSession();

    // 加载用户的文件夹列表
    useEffect(() => {
        if (session) {
            getFoldersByUserId(session.user.id as string)
                .then((loadedFolders) => {
                    setFolders(loadedFolders);
                    // 如果有文件夹且未选择，默认选择第一个
                    if (loadedFolders.length > 0 && !selectedFolderId) {
                        setSelectedFolderId(loadedFolders[0].id);
                    }
                });
        }
    }, [session, selectedFolderId]);

    // 将 code 转换为 nativeName
    const getNativeName = (code: string) => {
        return POPULAR_LANGUAGES.find(l => l.code === code)?.nativeName || code;
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        setHasSearched(true);
        setSearchResult(null);

        const result = await performDictionaryLookup(
            {
                text: searchQuery,
                queryLang: getNativeName(queryLang),
                definitionLang: getNativeName(definitionLang)
            },
            t
        );

        if (result.success && result.data) {
            setSearchResult(result.data);
        } else {
            setSearchResult(null);
        }

        setIsSearching(false);
    };

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#35786f]">
            {/* 搜索区域 */}
            <div className="flex items-center justify-center px-4 py-12">
                <Container className="max-w-3xl w-full p-4">
                    <SearchForm
                        searchQuery={searchQuery}
                        onSearchQueryChange={setSearchQuery}
                        isSearching={isSearching}
                        onSearch={handleSearch}
                        queryLang={queryLang}
                        onQueryLangChange={setQueryLang}
                        definitionLang={definitionLang}
                        onDefinitionLangChange={setDefinitionLang}
                    />
                </Container>
            </div>

            {/* 搜索结果区域 */}
            <div className="flex-1 px-4 pb-12">
                <Container className="max-w-3xl w-full p-4">
                    {isSearching && (
                        <div className="text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                            <p className="mt-4 text-white">{t("loading")}</p>
                        </div>
                    )}

                    {!isSearching && hasSearched && !searchResult && (
                        <div className="text-center py-12 bg-white/20 rounded-lg">
                            <p className="text-gray-800 text-xl">{t("noResults")}</p>
                            <p className="text-gray-600 mt-2">{t("tryOtherWords")}</p>
                        </div>
                    )}

                    {!isSearching && searchResult && (
                        <SearchResult
                            searchResult={searchResult}
                            searchQuery={searchQuery}
                            queryLang={queryLang}
                            definitionLang={definitionLang}
                            folders={folders}
                            selectedFolderId={selectedFolderId}
                            onFolderSelect={setSelectedFolderId}
                            onResultUpdate={setSearchResult}
                            onSearchingChange={setIsSearching}
                            getNativeName={getNativeName}
                        />
                    )}

                    {!hasSearched && (
                        <div className="text-center py-12 bg-white/20 rounded-lg">
                            <div className="text-6xl mb-4">📚</div>
                            <p className="text-gray-800 text-xl mb-2">{t("welcomeTitle")}</p>
                            <p className="text-gray-600">{t("welcomeHint")}</p>
                        </div>
                    )}
                </Container>
            </div>
        </div>
    );
}
