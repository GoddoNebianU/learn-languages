import { TSharedEntry } from "@/shared";

interface DictionaryEntryProps {
    entry: TSharedEntry;
}

export function DictionaryEntry({ entry }: DictionaryEntryProps) {
    return (
        <div>
            {/* 音标和词性 */}
            <div className="flex items-center gap-3 mb-3">
                {entry.ipa && (
                    <span className="text-gray-600 text-lg">
                        [{entry.ipa}]
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
    );
}
