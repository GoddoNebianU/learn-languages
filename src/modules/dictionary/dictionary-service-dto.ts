import { TSharedItem } from "@/shared";

export type LookUpServiceInputDto = {
    text: string,
    queryLang: string,
    definitionLang: string,
    forceRelook: boolean,
    userId?: string;
};

export type LookUpServiceOutputDto = TSharedItem;
