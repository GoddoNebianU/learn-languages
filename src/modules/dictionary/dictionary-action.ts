"use server";

import { DictionaryActionInputDto, DictionaryActionOutputDto, validateDictionaryActionInput } from "./dictionary-action-dto";
import { ValidateError } from "@/lib/errors";
import { lookUpService } from "./dictionary-service";

export const lookUpDictionaryAction = async (dto: DictionaryActionInputDto): Promise<DictionaryActionOutputDto> => {
    try {
        return {
            message: 'success',
            success: true,
            data: await lookUpService(validateDictionaryActionInput(dto))
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
