import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/config/i18n";
import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export default getRequestConfig(async () => {
  const store = await cookies();
  const locale = (() => {
    const locale = store.get("locale")?.value ?? DEFAULT_LOCALE;
    if (!SUPPORTED_LOCALES.includes(locale)) return DEFAULT_LOCALE;
    return locale;
  })();

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
