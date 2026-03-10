import { z } from "zod";

export const schemaActionInputProcessOCR = z.object({
  imageBase64: z.string().min(1, "Image is required"),
  folderId: z.number().int().positive("Folder ID must be positive"),
  sourceLanguage: z.string().optional(),
  targetLanguage: z.string().optional(),
});

export type ActionInputProcessOCR = z.infer<typeof schemaActionInputProcessOCR>;

export interface ActionOutputProcessOCR {
  success: boolean;
  message: string;
  data?: {
    pairsCreated: number;
    sourceLanguage?: string;
    targetLanguage?: string;
  };
}
