import { TSharedEntry } from "@/shared/dictionary-type";
import { useTranslations } from "next-intl";

interface DictionaryEntryProps {
    entry: TSharedEntry;
}

export function DictionaryEntry({ entry }: DictionaryEntryProps) {
    const t = useTranslations("dictionary");
    
    return (
        <div>
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

            <div className="mb-3">
                <h3 className="text-sm font-semibold text-gray-700 mb-1">
                    {t("definition")}
                </h3>
                <p className="text-gray-800">{entry.definition}</p>
            </div>

            {entry.example && (
                <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">
                        {t("example")}
                    </h3>
                    <p className="text-gray-700 pl-4 border-l-4 border-[#35786f]">
                        {entry.example}
                    </p>
                </div>
            )}
        </div>
    );
}
