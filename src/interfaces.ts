import z from "zod";

export interface Word {
  word: string;
  x: number;
  y: number;
}
export interface Letter {
  letter: string;
  letter_name_ipa: string;
  letter_sound_ipa: string;
  roman_letter?: string;
}
export type SupportedAlphabets =
  | "japanese"
  | "english"
  | "esperanto"
  | "uyghur";
export const TextSpeakerItemSchema = z.object({
  text: z.string(),
  ipa: z.string().optional(),
  locale: z.string(),
});
export const TextSpeakerArraySchema = z.array(TextSpeakerItemSchema);

export const WordDataSchema = z.object({
  locales: z.tuple([z.string(), z.string()])
    .refine(([first, second]) => first !== second, {
      message: "Locales must be different"
    }),
  wordPairs: z.array(z.tuple([z.string(), z.string()]))
    .min(1, "At least one word pair is required")
    .refine((pairs) => {
      return pairs.every(([first, second]) => first.trim() !== '' && second.trim() !== '');
    }, {
      message: "Word pairs cannot contain empty strings"
    })
});

export type WordData = z.infer<typeof WordDataSchema>;
