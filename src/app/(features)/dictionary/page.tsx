"use client";

import { useState, useEffect } from "react";
import Container from "@/components/ui/Container";
import { LightButton } from "@/components/ui/buttons";
import { lookUp } from "@/lib/server/bigmodel/dictionaryActions";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Folder } from "../../../../generated/prisma/browser";
import { getFoldersByUserId } from "@/lib/server/services/folderService";
import { createPair } from "@/lib/server/services/pairService";

// 主流语言列表
const POPULAR_LANGUAGES = [
    { code: "english", name: "英语" },
    { code: "chinese", name: "中文" },
    { code: "japanese", name: "日语" },
    { code: "korean", name: "韩语" },
    { code: "french", name: "法语" },
    { code: "german", name: "德语" },
    { code: "italian", name: "意大利语" },
    { code: "spanish", name: "西班牙语" },
];

type DictionaryWordEntry = {
    ipa: string;
    definition: string;
    partOfSpeech: string;
    example: string;
};

type DictionaryPhraseEntry = {
    definition: string;
    example: string;
};

type DictionaryErrorResponse = {
    error: string;
};

type DictionarySuccessResponse = {
    standardForm: string;
    entries: (DictionaryWordEntry | DictionaryPhraseEntry)[];
};

type DictionaryResponse = DictionarySuccessResponse | DictionaryErrorResponse;

// 类型守卫：判断是否为单词条目
function isWordEntry(entry: DictionaryWordEntry | DictionaryPhraseEntry): entry is DictionaryWordEntry {
    return "ipa" in entry && "partOfSpeech" in entry;
}

// 类型守卫：判断是否为错误响应
function isErrorResponse(response: DictionaryResponse): response is DictionaryErrorResponse {
    return "error" in response;
}

export default function Dictionary() {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResult, setSearchResult] = useState<DictionaryResponse | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [queryLang, setQueryLang] = useState("english");
    const [definitionLang, setDefinitionLang] = useState("chinese");
    const [showLangSettings, setShowLangSettings] = useState(false);
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

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        setHasSearched(true);
        setSearchResult(null);

        try {
            // 使用查询语言和释义语言
            const result = await lookUp(searchQuery, queryLang, definitionLang);

            // 检查是否为错误响应
            if (isErrorResponse(result)) {
                toast.error(result.error);
                setSearchResult(null);
            } else {
                setSearchResult(result);
            }
        } catch (error) {
            console.error("词典查询失败:", error);
            toast.error("查询失败，请稍后重试");
            setSearchResult(null);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#35786f]">
            {/* 搜索区域 */}
            <div className="flex items-center justify-center px-4 py-12">
                <Container className="max-w-3xl w-full p-4">
                    {/* 页面标题 */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                            词典
                        </h1>
                        <p className="text-gray-700 text-lg">
                            查询单词和短语，提供详细的释义和例句
                        </p>
                    </div>

                    {/* 搜索表单 */}
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                            placeholder="输入要查询的单词或短语..."
                            className="flex-1 px-4 py-3 text-lg text-gray-800 focus:outline-none border-b-2 border-gray-600 bg-white/90 rounded"
                        />
                        <LightButton
                            type="submit"
                            disabled={isSearching || !searchQuery.trim()}
                            className="px-6 py-3"
                        >
                            {isSearching ? "查询中..." : "查询"}
                        </LightButton>
                    </form>

                    {/* 语言设置 */}
                    <div className="mt-4 bg-white/20 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-gray-800 font-semibold">语言设置</span>
                            <LightButton
                                onClick={() => setShowLangSettings(!showLangSettings)}
                                className="text-sm px-4 py-2"
                            >
                                {showLangSettings ? "收起" : "展开"}
                            </LightButton>
                        </div>

                        {showLangSettings && (
                            <div className="space-y-4">
                                {/* 查询语言 */}
                                <div>
                                    <label className="block text-gray-700 text-sm mb-2">
                                        查询语言 (你要查询的单词/短语是什么语言)
                                    </label>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {POPULAR_LANGUAGES.map((lang) => (
                                            <LightButton
                                                key={lang.code}
                                                selected={queryLang === lang.code}
                                                onClick={() => setQueryLang(lang.code)}
                                                className="text-sm px-3 py-1"
                                            >
                                                {lang.name}
                                            </LightButton>
                                        ))}
                                    </div>
                                    <input
                                        type="text"
                                        value={queryLang}
                                        onChange={(e) => setQueryLang(e.target.value)}
                                        placeholder="或输入其他语言..."
                                        className="w-full px-3 py-2 text-sm text-gray-800 focus:outline-none border-b-2 border-gray-600 bg-white/90 rounded"
                                    />
                                </div>

                                {/* 释义语言 */}
                                <div>
                                    <label className="block text-gray-700 text-sm mb-2">
                                        释义语言 (你希望用什么语言查看释义)
                                    </label>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {POPULAR_LANGUAGES.map((lang) => (
                                            <LightButton
                                                key={lang.code}
                                                selected={definitionLang === lang.code}
                                                onClick={() => setDefinitionLang(lang.code)}
                                                className="text-sm px-3 py-1"
                                            >
                                                {lang.name}
                                            </LightButton>
                                        ))}
                                    </div>
                                    <input
                                        type="text"
                                        value={definitionLang}
                                        onChange={(e) => setDefinitionLang(e.target.value)}
                                        placeholder="或输入其他语言..."
                                        className="w-full px-3 py-2 text-sm text-gray-800 focus:outline-none border-b-2 border-gray-600 bg-white/90 rounded"
                                    />
                                </div>

                                {/* 当前设置显示 */}
                                <div className="text-center text-gray-700 text-sm pt-2 border-t border-gray-300">
                                    当前设置：查询 <span className="font-semibold">{POPULAR_LANGUAGES.find(l => l.code === queryLang)?.name || queryLang}</span>
                                    ，释义 <span className="font-semibold">{POPULAR_LANGUAGES.find(l => l.code === definitionLang)?.name || definitionLang}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 搜索提示 */}
                    <div className="mt-4 text-center text-gray-700 text-sm">
                        <p>试试搜索：hello, look up, dictionary</p>
                    </div>
                </Container>
            </div>

            {/* 搜索结果区域 */}
            <div className="flex-1 px-4 pb-12">
                <Container className="max-w-3xl w-full p-4">
                    {isSearching && (
                        <div className="text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                            <p className="mt-4 text-white">加载中...</p>
                        </div>
                    )}

                    {!isSearching && hasSearched && !searchResult && (
                        <div className="text-center py-12 bg-white/20 rounded-lg">
                            <p className="text-gray-800 text-xl">未找到结果</p>
                            <p className="text-gray-600 mt-2">尝试其他单词或短语</p>
                        </div>
                    )}

                    {!isSearching && searchResult && !isErrorResponse(searchResult) && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-lg p-6 shadow-lg">
                                {/* 标题和保存按钮 */}
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex-1">
                                        <h2 className="text-3xl font-bold text-gray-800 mb-2">
                                            {searchResult.standardForm}
                                        </h2>
                                        {searchResult.standardForm !== searchQuery && (
                                            <p className="text-gray-500 text-sm">
                                                原始输入: {searchQuery}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                        {session && folders.length > 0 && (
                                            <select
                                                value={selectedFolderId || ""}
                                                onChange={(e) => setSelectedFolderId(e.target.value ? Number(e.target.value) : null)}
                                                className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#35786f]"
                                            >
                                                {folders.map((folder) => (
                                                    <option key={folder.id} value={folder.id}>
                                                        {folder.name}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                        <button
                                            onClick={() => {
                                                if (!session) {
                                                    toast.error("请先登录");
                                                    return;
                                                }
                                                if (!selectedFolderId) {
                                                    toast.error("请先创建文件夹");
                                                    return;
                                                }
                                                if (!searchResult || isErrorResponse(searchResult)) return;

                                                const entry = searchResult.entries[0];
                                                createPair({
                                                    text1: searchResult.standardForm,
                                                    text2: entry.definition,
                                                    language1: queryLang,
                                                    language2: definitionLang,
                                                    ipa1: isWordEntry(entry) ? entry.ipa : undefined,
                                                    folder: {
                                                        connect: {
                                                            id: selectedFolderId,
                                                        },
                                                    },
                                                })
                                                    .then(() => {
                                                        const folderName = folders.find(f => f.id === selectedFolderId)?.name;
                                                        toast.success(`已保存到文件夹：${folderName}`);
                                                    })
                                                    .catch(() => {
                                                        toast.error("保存失败，请稍后重试");
                                                    });
                                            }}
                                            className="hover:bg-gray-200 hover:cursor-pointer rounded-4xl border border-gray-200 w-10 h-10 flex justify-center items-center flex-shrink-0"
                                            title="保存到文件夹"
                                        >
                                            <Plus />
                                        </button>
                                    </div>
                                </div>

                                {/* 条目列表 */}
                                <div className="space-y-6">
                                    {searchResult.entries.map((entry, index) => (
                                        <div key={index} className="border-t border-gray-200 pt-4">
                                            {isWordEntry(entry) ? (
                                                // 单词条目
                                                <div>
                                                    {/* 音标和词性 */}
                                                    <div className="flex items-center gap-3 mb-3">
                                                        {entry.ipa && (
                                                            <span className="text-gray-600 text-lg">
                                                                {entry.ipa}
                                                            </span>
                                                        )}
                                                        {entry.partOfSpeech && (
                                                            <span className="px-3 py-1 bg-[#35786f] text-white text-sm rounded-full">
                                                                {entry.partOfSpeech}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* 释义 */}
                                                    <div className="mb-3">
                                                        <h3 className="text-sm font-semibold text-gray-700 mb-1">
                                                            释义
                                                        </h3>
                                                        <p className="text-gray-800">{entry.definition}</p>
                                                    </div>

                                                    {/* 例句 */}
                                                    {entry.example && (
                                                        <div>
                                                            <h3 className="text-sm font-semibold text-gray-700 mb-1">
                                                                例句
                                                            </h3>
                                                            <p className="text-gray-700 pl-4 border-l-4 border-[#35786f]">
                                                                {entry.example}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                // 短语条目
                                                <div>
                                                    {/* 释义 */}
                                                    <div className="mb-3">
                                                        <h3 className="text-sm font-semibold text-gray-700 mb-1">
                                                            释义
                                                        </h3>
                                                        <p className="text-gray-800">{entry.definition}</p>
                                                    </div>

                                                    {/* 例句 */}
                                                    {entry.example && (
                                                        <div>
                                                            <h3 className="text-sm font-semibold text-gray-700 mb-1">
                                                                例句
                                                            </h3>
                                                            <p className="text-gray-700 pl-4 border-l-4 border-[#35786f]">
                                                                {entry.example}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {!hasSearched && (
                        <div className="text-center py-12 bg-white/20 rounded-lg">
                            <div className="text-6xl mb-4">📚</div>
                            <p className="text-gray-800 text-xl mb-2">欢迎使用词典</p>
                            <p className="text-gray-600">在上方搜索框中输入单词或短语开始查询</p>
                        </div>
                    )}
                </Container>
            </div>
        </div>
    );
}
