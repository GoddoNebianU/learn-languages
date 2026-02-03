import { Container } from "@/components/ui/Container";
import { SearchForm } from "./SearchForm";
import { SearchResult } from "./SearchResult";
import { getTranslations } from "next-intl/server";
import { actionLookUpDictionary } from "@/modules/dictionary/dictionary-action";
import { TSharedItem } from "@/shared/dictionary-type";

interface DictionaryPageProps {
    searchParams: Promise<{ q?: string; ql?: string; dl?: string; }>;
}

export default async function DictionaryPage({ searchParams }: DictionaryPageProps) {
    const t = await getTranslations("dictionary");

    // 从 searchParams 获取搜索参数
    const { q: searchQuery, ql: queryLang = "english", dl: definitionLang = "chinese" } = await searchParams;

    // 如果有搜索查询，获取搜索结果
    let searchResult: TSharedItem | undefined | null = null;
    if (searchQuery) {
        const getNativeName = (code: string): string => {
            const popularLanguages: Record<string, string> = {
                english: "English",
                chinese: "中文",
                japanese: "日本語",
                korean: "한국어",
                italian: "Italiano",
                uyghur: "ئۇيغۇرچە",
            };
            return popularLanguages[code] || code;
        };

        const result = await actionLookUpDictionary({
            text: searchQuery,
            queryLang: getNativeName(queryLang),
            definitionLang: getNativeName(definitionLang),
            forceRelook: false
        });

        if (result.success && result.data) {
            searchResult = result.data;
        }
    }

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#35786f]">
            {/* 搜索区域 */}
            <div className="flex items-center justify-center px-4 py-12">
                <Container className="max-w-3xl w-full p-4">
                    <SearchForm
                        defaultQueryLang={queryLang}
                        defaultDefinitionLang={definitionLang}
                    />
                </Container>
            </div>

            {/* 搜索结果区域 */}
            <div className="flex-1 px-4 pb-12">
                <Container className="max-w-3xl w-full p-4">
                    {searchQuery && (
                        <SearchResult
                            searchResult={searchResult}
                            searchQuery={searchQuery}
                            queryLang={queryLang}
                            definitionLang={definitionLang}
                        />
                    )}
                    {!searchQuery && (
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
