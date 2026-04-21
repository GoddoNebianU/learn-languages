import { ValidateError } from "@/lib/errors";
import z from "zod";

export const validate = <T, U extends z.ZodType>(dto: T, schema: U) => {
    const result = schema.safeParse(dto);
    if (result.success) return result.data as z.infer<U>;
    const errorMessages = result.error.issues.map((issue) =>
        `${issue.path.join('.')}: ${issue.message}`
    ).join('; ');
    throw new ValidateError(`Validation failed: ${errorMessages}`);
};

export const generateValidator = <S extends z.ZodType>(schema: S) => (dto: unknown) => validate(dto, schema);
