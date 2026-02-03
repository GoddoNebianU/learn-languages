"use client";

import { Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { actionCreatePair } from "@/modules/folder/folder-aciton";
import { TSharedItem } from "@/shared/dictionary-type";
import { TSharedFolder } from "@/shared/folder-type";
import { actionLookUpDictionary } from "@/modules/dictionary/dictionary-action";
import { useRouter } from "next/navigation";

type Session = {
    user: {
        id: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
} | null;

interface SaveButtonClientProps {
    session: Session;
    folders: TSharedFolder[];
    searchResult: TSharedItem;
    queryLang: string;
    definitionLang: string;
}

export function SaveButtonClient({ session, folders, searchResult, queryLang, definitionLang }: SaveButtonClientProps) {
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

        const definition = searchResult.entries.reduce((p, e) => {
            return { ...p, definition: p.definition + ' | ' + e.definition };
        }).definition;

        try {
            await actionCreatePair({
                text1: searchResult.standardForm,
                text2: definition,
                language1: queryLang,
                language2: definitionLang,
                ipa1: searchResult.entries[0].ipa,
                folderId: folderId,
            });

            const folderName = folders.find((f) => f.id === folderId)?.name || "Unknown";
            toast.success(`Saved to ${folderName}`);
        } catch (error) {
            toast.error("Save failed");
        }
    };

    return (
        <button
            onClick={handleSave}
            className="hover:bg-gray-200 hover:cursor-pointer rounded-4xl border border-gray-200 w-10 h-10 flex justify-center items-center shrink-0"
            title="Save to folder"
        >
            <Plus />
        </button>
    );
}

interface ReLookupButtonClientProps {
    searchQuery: string;
    queryLang: string;
    definitionLang: string;
}

export function ReLookupButtonClient({ searchQuery, queryLang, definitionLang }: ReLookupButtonClientProps) {
    const router = useRouter();

    const handleRelookup = async () => {
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

        try {
            await actionLookUpDictionary({
                text: searchQuery,
                queryLang: getNativeName(queryLang),
                definitionLang: getNativeName(definitionLang),
                forceRelook: true
            });

            toast.success("Re-lookup successful");
            // 刷新页面以显示新结果
            router.refresh();
        } catch (error) {
            toast.error("Re-lookup failed");
        }
    };

    return (
        <button
            onClick={handleRelookup}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
            <RefreshCw className="w-4 h-4" />
            Re-lookup
        </button>
    );
}
