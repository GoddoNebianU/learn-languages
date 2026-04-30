import z from "zod";
import { generateValidator } from "@/utils/validate";

export const schemaActionLookUpDictionary = z.object({
  text: z.string().min(1),
  queryLang: z.string().min(1),
  definitionLang: z.string().min(1),
  deckId: z.number().int().positive().optional(),
});

export type ActionInputLookUpDictionary = z.infer<typeof schemaActionLookUpDictionary>;
export const validateActionInputLookUpDictionary = generateValidator(schemaActionLookUpDictionary);

export type ActionOutputLookUpDictionary = {
  success: boolean;
  message: string;
  data?: {
    standardForm: string;
    entries: Array<{
      ipa?: string;
      definition: string;
      partOfSpeech?: string;
      example: string;
    }>;
    alreadyExists?: boolean;
  };
};
