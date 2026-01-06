import { DictWordEntry, DictPhraseEntry } from "./types";

interface DictionaryEntryProps {
    entry: DictWordEntry | DictPhraseEntry;
}

export function DictionaryEntry({ entry }: DictionaryEntryProps) {
    // 检查是否有 ipa 字段来判断是否为单词条目
    const isWordEntry = "ipa" in entry && "partOfSpeech" in entry;

    if (isWordEntry) {
        // 单词条目
        const wordEntry = entry as DictWordEntry;
        return (
            <div>
                {/* 音标和词性 */}
                <div className="flex items-center gap-3 mb-3">
                    {wordEntry.ipa && (
                        <span className="text-gray-600 text-lg">
                            [{wordEntry.ipa}]
                        </span>
                    )}
                    {wordEntry.partOfSpeech && (
                        <span className="px-3 py-1 bg-[#35786f] text-white text-sm rounded-full">
                            {wordEntry.partOfSpeech}
                        </span>
                    )}
                </div>

                {/* 释义 */}
                <div className="mb-3">
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">
                        释义
                    </h3>
                    <p className="text-gray-800">{wordEntry.definition}</p>
                </div>

                {/* 例句 */}
                {wordEntry.example && (
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-1">
                            例句
                        </h3>
                        <p className="text-gray-700 pl-4 border-l-4 border-[#35786f]">
                            {wordEntry.example}
                        </p>
                    </div>
                )}
            </div>
        );
    }

    // 短语条目
    const phraseEntry = entry as DictPhraseEntry;
    return (
        <div>
            {/* 释义 */}
            <div className="mb-3">
                <h3 className="text-sm font-semibold text-gray-700 mb-1">
                    释义
                </h3>
                <p className="text-gray-800">{phraseEntry.definition}</p>
            </div>

            {/* 例句 */}
            {phraseEntry.example && (
                <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">
                        例句
                    </h3>
                    <p className="text-gray-700 pl-4 border-l-4 border-[#35786f]">
                        {phraseEntry.example}
                    </p>
                </div>
            )}
        </div>
    );
}
