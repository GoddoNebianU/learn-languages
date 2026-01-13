import { toast } from "sonner";
import { lookUpDictionaryAction } from "@/modules/dictionary/dictionary-action";
import { DictionaryActionInputDto, DictionaryActionOutputDto } from "@/modules/dictionary";
import { TSharedItem } from "@/shared";

export async function performDictionaryLookup(
    options: DictionaryActionInputDto,
    t?: (key: string) => string
): Promise<TSharedItem | null> {
    const { text, queryLang, definitionLang, forceRelook = false, userId } = options;
    const result = await lookUpDictionaryAction({
        text,
        queryLang,
        definitionLang,
        forceRelook,
        userId
    });

    if (!result.success || !result.data) return null;

    if (forceRelook && t) {
        toast.success(t("relookupSuccess"));
    }
    return result.data;
}
