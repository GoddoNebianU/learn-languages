import { z } from "zod";

export const schemaServiceInputProcessOCR = z.object({
  imageBase64: z.string().min(1, "Image is required"),
  deckId: z.number().int().positive("Deck ID must be positive"),
  sourceLanguage: z.string().optional(),
  targetLanguage: z.string().optional(),
});

export type ServiceInputProcessOCR = z.infer<typeof schemaServiceInputProcessOCR>;

export interface ServiceOutputProcessOCR {
  success: boolean;
  message: string;
  data?: {
    pairsCreated: number;
    sourceLanguage?: string;
    targetLanguage?: string;
  };
}
