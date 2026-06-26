export function openDictionary(word: string, queryLang?: string, defLang?: string) {
  const params = new URLSearchParams();
  params.set("q", word);
  if (queryLang) params.set("ql", queryLang);
  if (defLang) params.set("dl", defLang);
  window.open(`/dictionary?${params.toString()}`, "_blank");
}

export const DICT_LANGUAGES = [
  { value: "chinese", label: "中文" },
  { value: "english", label: "English" },
  { value: "japanese", label: "日本語" },
  { value: "korean", label: "한국어" },
  { value: "french", label: "Français" },
  { value: "german", label: "Deutsch" },
  { value: "spanish", label: "Español" },
  { value: "russian", label: "Русский" },
  { value: "esperanto", label: "Esperanto" },
];

const STORAGE_KEY = "dict-def-lang";

export function getDictDefLang(): string {
  if (typeof window === "undefined") return "chinese";
  return localStorage.getItem(STORAGE_KEY) || "chinese";
}

export function setDictDefLang(lang: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, lang);
}
