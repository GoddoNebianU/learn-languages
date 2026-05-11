import type { ReadingResult } from "@/shared/reading-type";
import { generateValidator } from "@/utils/validate";
import z from "zod";

const schemaActionInputReadText = z.object({
  text: z.string().min(1).max(5000),
  targetLanguage: z.string().min(1).max(50),
  sourceLanguage: z.string().min(1).max(50).optional(),
});

export type ActionInputReadText = z.infer<typeof schemaActionInputReadText>;

export const validateActionInputReadText = generateValidator(schemaActionInputReadText);

export type ActionOutputReadText = {
  success: boolean;
  message: string;
  data?: ReadingResult;
};
