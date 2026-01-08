export type DictLookUpRequest = {
    text: string,
    queryLang: string,
    definitionLang: string,
    userId?: string,
    forceRelook?: boolean;
};

export type DictWordEntry = {
    ipa: string;
    definition: string;
    partOfSpeech: string;
    example: string;
};

export type DictPhraseEntry = {
    definition: string;
    example: string;
};

export type DictErrorResponse = {
    error: string;
};

export type DictWordResponse = {
    standardForm: string;
    entries: DictWordEntry[];
};

export type DictPhraseResponse = {
    standardForm: string;
    entries: DictPhraseEntry[];
};

export type DictLookUpResponse =
    | DictErrorResponse
    | DictWordResponse
    | DictPhraseResponse;

// 类型守卫：判断是否为错误响应
export function isDictErrorResponse(
    response: DictLookUpResponse
): response is DictErrorResponse {
    return "error" in response;
}

// 类型守卫：判断是否为单词响应
export function isDictWordResponse(
    response: DictLookUpResponse
): response is DictWordResponse {
    if (isDictErrorResponse(response)) return false;
    const entries = (response as DictWordResponse | DictPhraseResponse).entries;
    return entries.length > 0 && "ipa" in entries[0] && "partOfSpeech" in entries[0];
}

// 类型守卫：判断是否为短语响应
export function isDictPhraseResponse(
    response: DictLookUpResponse
): response is DictPhraseResponse {
    if (isDictErrorResponse(response)) return false;
    const entries = (response as DictWordResponse | DictPhraseResponse).entries;
    return entries.length > 0 && !("ipa" in entries[0] || "partOfSpeech" in entries[0]);
}
