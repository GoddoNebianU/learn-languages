export const POPULAR_LANGUAGES = [
  { code: "english", name: "英语", nativeName: "English" },
  { code: "chinese", name: "中文", nativeName: "中文" },
  { code: "japanese", name: "日语", nativeName: "日本語" },
  { code: "korean", name: "韩语", nativeName: "한국어" },
  { code: "italian", name: "意大利语", nativeName: "Italiano" },
  { code: "uyghur", name: "维吾尔语", nativeName: "ئۇيغۇرچە" },
] as const;

const POPULAR_LANGUAGES_MAP: Record<string, string> = {
  english: "English",
  chinese: "中文",
  japanese: "日本語",
  korean: "한국어",
  italian: "Italiano",
  uyghur: "ئۇيغۇرچە",
};

export function getNativeName(code: string): string {
  return POPULAR_LANGUAGES_MAP[code] || code;
}
