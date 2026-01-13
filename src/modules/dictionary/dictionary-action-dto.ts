import { ValidateError } from "@/lib/errors";
import { TSharedItem } from "@/shared";
import z from "zod";

const DictionaryActionInputDtoSchema = z.object({
    text: z.string().min(1, 'Empty text.').max(30, 'Text too long.'),
    queryLang: z.string().min(1, 'Query lang too short.').max(20, 'Query lang too long.'),
    forceRelook: z.boolean(),
    definitionLang: z.string().min(1, 'Definition lang too short.').max(20, 'Definition lang too long.'),
    userId: z.string().optional()
});

export type DictionaryActionInputDto = z.infer<typeof DictionaryActionInputDtoSchema>;

export const validateDictionaryActionInput = (dto: DictionaryActionInputDto): DictionaryActionInputDto => {
    const result = DictionaryActionInputDtoSchema.safeParse(dto);
    if (result.success) return result.data;

    const errorMessages = result.error.issues.map((issue) =>
        `${issue.path.join('.')}: ${issue.message}`
    ).join('; ');

    throw new ValidateError(`Validation failed: ${errorMessages}`);
};

export type DictionaryActionOutputDto = {
    message: string,
    success: boolean;
    data?: TSharedItem;
};
