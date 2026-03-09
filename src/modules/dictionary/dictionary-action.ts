"use server";

import { ActionInputLookUpDictionary, ActionOutputLookUpDictionary, validateActionInputLookUpDictionary } from "./dictionary-action-dto";
import { ValidateError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";
import { serviceLookUp } from "./dictionary-service";

const log = createLogger("dictionary-action");

export const actionLookUpDictionary = async (dto: ActionInputLookUpDictionary): Promise<ActionOutputLookUpDictionary> => {
    try {
        return {
            message: 'success',
            success: true,
            data: await serviceLookUp(validateActionInputLookUpDictionary(dto))
        };
    } catch (e) {
        if (e instanceof ValidateError) {
            return {
                success: false,
                message: e.message
            };
        }
        log.error("Dictionary lookup failed", { error: e instanceof Error ? e.message : String(e) });
        return {
            success: false,
            message: 'Unknown error occured.'
        };
    }
};
