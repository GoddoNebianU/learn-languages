import { TSharedItem } from "@/shared/dictionary-type";

export type ServiceInputLookUp = {
    text: string,
    queryLang: string,
    definitionLang: string,
    forceRelook: boolean,
    userId?: string;
};

export type ServiceOutputLookUp = TSharedItem;
