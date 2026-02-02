import z from "zod";

// Text Speaker types
export const TextSpeakerItemSchema = z.object({
  text: z.string(),
  language: z.string(),
  ipa: z.string().optional(),
});

export const TextSpeakerArraySchema = z.array(TextSpeakerItemSchema);

// Alphabet types
export type SupportedAlphabets = "japanese" | "english" | "uyghur" | "esperanto";

export interface Letter {
  letter: string;
  letter_sound_ipa: string;
  roman_letter?: string;
}
