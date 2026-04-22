import { TSharedEntry } from "@/shared/dictionary-type";
import { useTranslations } from "next-intl";

interface DictionaryEntryProps {
  entry: TSharedEntry;
}

export function DictionaryEntry({ entry }: DictionaryEntryProps) {
  const t = useTranslations("dictionary");

  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        {entry.ipa && <span className="text-lg text-gray-600">[{entry.ipa}]</span>}
        {entry.partOfSpeech && (
          <span className="rounded-full bg-[#35786f] px-3 py-1 text-sm text-white">
            {entry.partOfSpeech}
          </span>
        )}
      </div>

      <div className="mb-3">
        <h3 className="mb-1 text-sm font-semibold text-gray-700">{t("definition")}</h3>
        <p className="text-gray-800">{entry.definition}</p>
      </div>

      {entry.example && (
        <div>
          <h3 className="mb-1 text-sm font-semibold text-gray-700">{t("example")}</h3>
          <p className="border-l-4 border-[#35786f] pl-4 text-gray-700">{entry.example}</p>
        </div>
      )}
    </div>
  );
}
