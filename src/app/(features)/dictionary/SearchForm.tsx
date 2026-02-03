"use client";

import { LightButton } from "@/components/ui/buttons";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { POPULAR_LANGUAGES } from "./constants";

interface SearchFormProps {
    defaultQueryLang?: string;
    defaultDefinitionLang?: string;
}

export function SearchForm({ defaultQueryLang = "english", defaultDefinitionLang = "chinese" }: SearchFormProps) {
    const t = useTranslations("dictionary");
    const [queryLang, setQueryLang] = useState(defaultQueryLang);
    const [definitionLang, setDefinitionLang] = useState(defaultDefinitionLang);
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const searchQuery = formData.get("searchQuery") as string;

        if (!searchQuery?.trim()) return;

        const params = new URLSearchParams({
            q: searchQuery,
            ql: queryLang,
            dl: definitionLang,
        });

        router.push(`/dictionary?${params.toString()}`);
    };

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
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
                <input
                    type="text"
                    name="searchQuery"
                    defaultValue=""
                    placeholder={t("searchPlaceholder")}
                    className="flex-1 min-w-0 px-4 py-3 text-lg text-gray-800 focus:outline-none border-b-2 border-gray-600 bg-white/90 rounded"
                    required
                />
                <LightButton
                    type="submit"
                    className="px-6 py-3 whitespace-nowrap text-center sm:min-w-30"
                >
                    {t("search")}
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
                        <div className="flex flex-wrap gap-2">
                            {POPULAR_LANGUAGES.map((lang) => (
                                <LightButton
                                    key={lang.code}
                                    type="button"
                                    selected={queryLang === lang.code}
                                    onClick={() => setQueryLang(lang.code)}
                                    className="text-sm px-3 py-1"
                                >
                                    {lang.nativeName}
                                </LightButton>
                            ))}
                        </div>
                    </div>

                    {/* 释义语言 */}
                    <div>
                        <label className="block text-gray-700 text-sm mb-2">
                            {t("definitionLanguage")} ({t("definitionLanguageHint")})
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {POPULAR_LANGUAGES.map((lang) => (
                                <LightButton
                                    key={lang.code}
                                    type="button"
                                    selected={definitionLang === lang.code}
                                    onClick={() => setDefinitionLang(lang.code)}
                                    className="text-sm px-3 py-1"
                                >
                                    {lang.nativeName}
                                </LightButton>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
