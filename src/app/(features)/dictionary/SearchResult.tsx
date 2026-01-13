import { Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Folder } from "../../../../generated/prisma/browser";
import { createPair } from "@/lib/server/services/pairService";
import {
    DictWordResponse,
    DictPhraseResponse,
    isDictWordResponse,
    DictWordEntry,
} from "./types";
import { DictionaryEntry } from "./DictionaryEntry";
import { useTranslations } from "next-intl";
import { performDictionaryLookup } from "./utils";

interface SearchResultProps {
    searchResult: DictWordResponse | DictPhraseResponse;
    searchQuery: string;
    queryLang: string;
    definitionLang: string;
    folders: Folder[];
    selectedFolderId: number | null;
    onFolderSelect: (folderId: number | null) => void;
    onResultUpdate: (newResult: DictWordResponse | DictPhraseResponse) => void;
    onSearchingChange: (isSearching: boolean) => void;
    getNativeName: (code: string) => string;
}

export function SearchResult({
    searchResult,
    searchQuery,
    queryLang,
    definitionLang,
    folders,
    selectedFolderId,
    onFolderSelect,
    onResultUpdate,
    onSearchingChange,
    getNativeName,
}: SearchResultProps) {
    const t = useTranslations("dictionary");
    const { data: session } = authClient.useSession();

    const handleRelookup = async () => {
        onSearchingChange(true);

        const result = await performDictionaryLookup(
            {
                text: searchQuery,
                queryLang: getNativeName(queryLang),
                definitionLang: getNativeName(definitionLang),
                forceRelook: true
            },
            t
        );

        if (result.success && result.data) {
            onResultUpdate(result.data);
        }

        onSearchingChange(false);
    };

    const handleSave = () => {
        if (!session) {
            toast.error(t("pleaseLogin"));
            return;
        }
        if (!selectedFolderId) {
            toast.error(t("pleaseCreateFolder"));
            return;
        }

        const entry = searchResult.entries[0];
        createPair({
            text1: searchResult.standardForm,
            text2: entry.definition,
            language1: queryLang,
            language2: definitionLang,
            ipa1: isDictWordResponse(searchResult) && (entry as DictWordEntry).ipa ? (entry as DictWordEntry).ipa : undefined,
            folderId: selectedFolderId,
        })
            .then(() => {
                const folderName = folders.find(f => f.id === selectedFolderId)?.name || "Unknown";
                toast.success(t("savedToFolder", { folderName }));
            })
            .catch(() => {
                toast.error(t("saveFailed"));
            });
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-lg">
                {/* 标题和保存按钮 */}
                <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">
                            {searchResult.standardForm}
                        </h2>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                        {session && folders.length > 0 && (
                            <select
                                value={selectedFolderId || ""}
                                onChange={(e) => onFolderSelect(e.target.value ? Number(e.target.value) : null)}
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
                            onClick={handleSave}
                            className="hover:bg-gray-200 hover:cursor-pointer rounded-4xl border border-gray-200 w-10 h-10 flex justify-center items-center shrink-0"
                            title={t("saveToFolder")}
                        >
                            <Plus />
                        </button>
                    </div>
                </div>

                {/* 条目列表 */}
                <div className="space-y-6">
                    {searchResult.entries.map((entry, index) => (
                        <div key={index} className="border-t border-gray-200 pt-4">
                            <DictionaryEntry entry={entry} />
                        </div>
                    ))}
                </div>

                {/* 重新查询按钮 */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                    <button
                        onClick={handleRelookup}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        {t("relookup")}
                    </button>
                </div>
            </div>
        </div>
    );
}
