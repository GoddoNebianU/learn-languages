import { TSharedItem } from "@/shared";

export type ServiceInputLookUp = {
    text: string,
    queryLang: string,
    definitionLang: string,
    forceRelook: boolean,
    userId?: string;
};

export type ServiceOutputLookUp = TSharedItem;
