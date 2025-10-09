
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

