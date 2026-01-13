import { toast } from "sonner";
import { lookUp } from "@/lib/server/bigmodel/dictionaryActions";
import {
    DictWordResponse,
    DictPhraseResponse,
} from "./types";

interface LookupOptions {
    text: string;
    queryLang: string;
    definitionLang: string;
    forceRelook?: boolean;
}

interface LookupResult {
    success: boolean;
    data?: DictWordResponse | DictPhraseResponse;
    error?: string;
}

/**
 * 执行词典查询的通用函数
 * @param options - 查询选项
 * @param t - 翻译函数
 * @returns 查询结果
 */
export async function performDictionaryLookup(
    options: LookupOptions,
    t?: (key: string) => string
): Promise<LookupResult> {
    const { text, queryLang, definitionLang, forceRelook = false } = options;

    try {
        const result = await lookUp({
            text,
            queryLang,
            definitionLang,
            forceRelook
        });

        // 成功时显示提示（仅强制重新查询时）
        if (forceRelook && t) {
            toast.success(t("relookupSuccess"));
        }

        return { success: true, data: result };
    } catch (error) {
        toast.error(String(error));
        return { success: false, error: String(error) };
    }
}
