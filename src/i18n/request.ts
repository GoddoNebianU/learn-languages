import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/config/i18n";
import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function loadMessagesFromDir(dirPath: string): Record<string, any> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const messages: Record<string, any> = {};
  try {
    const items = readdirSync(dirPath);

    for (const item of items) {
      const fullPath = join(dirPath, item);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        const dirMessages = loadMessagesFromDir(fullPath);
        Object.assign(messages, { [item]: dirMessages });
      } else if (item.endsWith(".json")) {
        try {
          const content = readFileSync(fullPath, "utf-8");
          const jsonContent = JSON.parse(content);
          Object.assign(messages, { [item.replace(".json", "")]: jsonContent });
        } catch (error) {
          console.warn(`Failed to load JSON file ${fullPath}:`, error);
        }
      }
    }
  } catch (error) {
    console.warn(`Failed to read directory ${dirPath}:`, error);
  }

  return messages;
}

export default getRequestConfig(async () => {
  const store = await cookies();
  const locale = (() => {
    const locale = store.get("locale")?.value ?? DEFAULT_LOCALE;
    if (!SUPPORTED_LOCALES.includes(locale)) return DEFAULT_LOCALE;
    return locale;
  })();

  const messagesPath = join(process.cwd(), "public/messages", locale);
  const messages = loadMessagesFromDir(messagesPath);

  return {
    locale,
    messages,
  };
});
