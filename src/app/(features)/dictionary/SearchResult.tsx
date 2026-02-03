import { auth } from "@/auth";
import { DictionaryEntry } from "./DictionaryEntry";
import { TSharedItem } from "@/shared/dictionary-type";
import { SaveButtonClient, ReLookupButtonClient } from "./SearchResult.client";
import { headers } from "next/headers";
import { actionGetFoldersByUserId } from "@/modules/folder/folder-aciton";
import { TSharedFolder } from "@/shared/folder-type";

interface SearchResultProps {
    searchResult: TSharedItem | null;
    searchQuery: string;
    queryLang: string;
    definitionLang: string;
}

export async function SearchResult({
    searchResult,
    searchQuery,
    queryLang,
    definitionLang
}: SearchResultProps) {
    // 获取用户会话和文件夹
    const session = await auth.api.getSession({ headers: await headers() });
    let folders: TSharedFolder[] = [];

    if (session?.user?.id) {
        const result = await actionGetFoldersByUserId(session.user.id as string);
        if (result.success && result.data) {
            folders = result.data;
        }
    }

    return (
        <div className="space-y-6">
            {!searchResult ? (
                <div className="text-center py-12 bg-white/20 rounded-lg">
                    <p className="text-gray-800 text-xl">No results found</p>
                    <p className="text-gray-600 mt-2">Try other words</p>
                </div>
            ) : (
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
                            <SaveButtonClient
                                session={session}
                                folders={folders}
                                searchResult={searchResult}
                                queryLang={queryLang}
                                definitionLang={definitionLang}
                            />
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
                        <ReLookupButtonClient
                            searchQuery={searchQuery}
                            queryLang={queryLang}
                            definitionLang={definitionLang}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
