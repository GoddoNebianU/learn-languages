"use client";

import { useTheme } from "@/components/theme-provider";
import { useTranslations } from "next-intl";
import { cn } from "@/utils/cn";
import { Button } from "@/design-system/button";

export default function SettingsPage() {
  const t = useTranslations("settings");
  const { currentTheme, setTheme, availableThemes } = useTheme();

  return (
    <div className="min-h-[calc(100vh-64px)] bg-white p-4 md:p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">{t("title")}</h1>

        <div className="space-y-6">
          <div>
            <h2 className="mb-3 text-lg font-semibold text-gray-800">{t("themeColor")}</h2>
            <p className="mb-4 text-sm text-gray-600">{t("themeColorDescription")}</p>

            <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
              {availableThemes.map((theme) => (
                <Button
                  key={theme.id}
                  variant="light"
                  onClick={() => setTheme(theme.id)}
                  className={cn(
                    "group relative flex h-auto flex-col items-center gap-2 rounded-lg p-2 transition-all",
                    currentTheme === theme.id ? "ring-2 ring-offset-2" : "hover:bg-gray-50"
                  )}
                  style={{
                    ["--tw-ring-color" as string]: theme.colors[500],
                  }}
                >
                  <div
                    className="h-8 w-8 rounded-full shadow-md ring-1 ring-black/10"
                    style={{ backgroundColor: theme.colors[500] }}
                  />
                  <span className="text-xs text-gray-600 group-hover:text-gray-900">
                    {theme.name}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
