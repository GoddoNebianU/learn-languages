"use server";

import { ActionInputLookUpDictionary, ActionOutputLookUpDictionary, validateActionInputLookUpDictionary } from "./dictionary-action-dto";
import { ValidateError } from "@/lib/errors";
import { serviceLookUp } from "./dictionary-service";

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
        console.log(e);
        return {
            success: false,
            message: 'Unknown error occured.'
        };
    }
};
