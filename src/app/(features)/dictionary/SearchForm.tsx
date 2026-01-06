import { LightButton } from "@/components/ui/buttons";
import { POPULAR_LANGUAGES } from "./constants";
import { useTranslations } from "next-intl";

interface SearchFormProps {
    searchQuery: string;
    onSearchQueryChange: (query: string) => void;
    isSearching: boolean;
    onSearch: (e: React.FormEvent) => void;
    queryLang: string;
    onQueryLangChange: (lang: string) => void;
    definitionLang: string;
    onDefinitionLangChange: (lang: string) => void;
}

export function SearchForm({
    searchQuery,
    onSearchQueryChange,
    isSearching,
    onSearch,
    queryLang,
    onQueryLangChange,
    definitionLang,
    onDefinitionLangChange,
}: SearchFormProps) {
    const t = useTranslations("dictionary");

    return (
        <>
            {/* 页面标题 */}
            <div className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                    {t("title")}
                </h1>
                <p className="text-gray-700 text-lg">
                    {t("description")}
                </p>
            </div>

            {/* 搜索表单 */}
            <form onSubmit={onSearch} className="flex gap-2">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchQueryChange(e.target.value)}
                    placeholder={t("searchPlaceholder")}
                    className="flex-1 px-4 py-3 text-lg text-gray-800 focus:outline-none border-b-2 border-gray-600 bg-white/90 rounded"
                />
                <LightButton
                    type="submit"
                    disabled={isSearching || !searchQuery.trim()}
                    className="px-6 py-3"
                >
                    {isSearching ? t("searching") : t("search")}
                </LightButton>
            </form>

            {/* 语言设置 */}
            <div className="mt-4 bg-white/20 rounded-lg p-4">
                <div className="mb-3">
                    <span className="text-gray-800 font-semibold">{t("languageSettings")}</span>
                </div>

                <div className="space-y-4">
                        {/* 查询语言 */}
                        <div>
                            <label className="block text-gray-700 text-sm mb-2">
                                {t("queryLanguage")} ({t("queryLanguageHint")})
                            </label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {POPULAR_LANGUAGES.map((lang) => (
                                    <LightButton
                                        key={lang.code}
                                        selected={queryLang === lang.code}
                                        onClick={() => onQueryLangChange(lang.code)}
                                        className="text-sm px-3 py-1"
                                    >
                                        {lang.nativeName}
                                    </LightButton>
                                ))}
                            </div>
                            <input
                                type="text"
                                value={queryLang}
                                onChange={(e) => onQueryLangChange(e.target.value)}
                                placeholder={t("otherLanguagePlaceholder")}
                                className="w-full px-3 py-2 text-sm text-gray-800 focus:outline-none border-b-2 border-gray-600 bg-white/90 rounded"
                            />
                        </div>

                        {/* 释义语言 */}
                        <div>
                            <label className="block text-gray-700 text-sm mb-2">
                                {t("definitionLanguage")} ({t("definitionLanguageHint")})
                            </label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {POPULAR_LANGUAGES.map((lang) => (
                                    <LightButton
                                        key={lang.code}
                                        selected={definitionLang === lang.code}
                                        onClick={() => onDefinitionLangChange(lang.code)}
                                        className="text-sm px-3 py-1"
                                    >
                                        {lang.nativeName}
                                    </LightButton>
                                ))}
                            </div>
                            <input
                                type="text"
                                value={definitionLang}
                                onChange={(e) => onDefinitionLangChange(e.target.value)}
                                placeholder={t("otherLanguagePlaceholder")}
                                className="w-full px-3 py-2 text-sm text-gray-800 focus:outline-none border-b-2 border-gray-600 bg-white/90 rounded"
                            />
                        </div>

                        {/* 当前设置显示 */}
                        <div className="text-center text-gray-700 text-sm pt-2 border-t border-gray-300">
                            {t("currentSettings", {
                                queryLang: POPULAR_LANGUAGES.find(l => l.code === queryLang)?.nativeName || queryLang,
                                definitionLang: POPULAR_LANGUAGES.find(l => l.code === definitionLang)?.nativeName || definitionLang
                            })}
                        </div>
                    </div>
            </div>

        </>
    );
}
