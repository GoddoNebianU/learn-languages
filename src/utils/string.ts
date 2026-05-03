export const stringNormalize = (s: string) => s.trim().toLowerCase();

// Strip wrapping [] and // from LLM-returned IPA strings
export function stripIpaBrackets(ipa: string): string {
  return ipa.trim().replace(/^[\[\/]+/, "").replace(/[\]\/]+$/, "");
}
