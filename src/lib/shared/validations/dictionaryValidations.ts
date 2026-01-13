import { DictLookUpRequest } from "@/lib/shared";

export const lookUpValidation = (req: DictLookUpRequest) => {
    const {
        text,
        queryLang,
        definitionLang,
    } = req;

    if (text.length > 30)
        throw Error("The input should not exceed 30 characters.");
    if (queryLang.length > 20)
        throw Error("The query language should not exceed 20 characters.");
    if (definitionLang.length > 20)
        throw Error("The definition language should not exceed 20 characters.");
    if (queryLang.length > 20)
        throw Error("The query language should not exceed 20 characters.");
    if (queryLang.length > 20)
        throw Error("The query language should not exceed 20 characters.");
    if (queryLang.length > 20)
        throw Error("The query language should not exceed 20 characters.");
};
