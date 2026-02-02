import { toast } from "sonner";
import { actionLookUpDictionary } from "@/modules/dictionary/dictionary-action";
import { ActionInputLookUpDictionary, ActionOutputLookUpDictionary } from "@/modules/dictionary/dictionary-action-dto";
import { TSharedItem } from "@/shared/dictionary-type";

export async function performDictionaryLookup(
    options: ActionInputLookUpDictionary,
    t?: (key: string) => string
): Promise<TSharedItem | null> {
    const { text, queryLang, definitionLang, forceRelook = false, userId } = options;
    const result = await actionLookUpDictionary({
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
