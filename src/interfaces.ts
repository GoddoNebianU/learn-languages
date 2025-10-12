import z from "zod";

export interface Word {
  word: string;
  x: number;
  y: number;
}export interface Letter {
    letter: string;
    letter_name_ipa: string;
    letter_sound_ipa: string;
    roman_letter?: string;
}
export type SupportedAlphabets = 'japanese' | 'english' | 'esperanto' | 'uyghur';
export const TextSpeakerItemSchema = z.object({
    text: z.string(),
    ipa: z.string().optional(),
    locale: z.string()
});
export const TextSpeakerArraySchema = z.array(TextSpeakerItemSchema);

