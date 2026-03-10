"use client";

import { useTheme } from "@/components/theme-provider";
import { useTranslations } from "next-intl";
import { cn } from "@/utils/cn";

export default function SettingsPage() {
  const t = useTranslations("settings");
  const { currentTheme, setTheme, availableThemes } = useTheme();

  return (
    <div className="min-h-[calc(100vh-64px)] bg-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {t("title")}
        </h1>

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              {t("themeColor")}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              {t("themeColorDescription")}
            </p>
            
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
              {availableThemes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setTheme(theme.id)}
                  className={cn(
                    "group relative flex flex-col items-center gap-2 p-2 rounded-lg transition-all",
                    currentTheme === theme.id
                      ? "ring-2 ring-offset-2"
                      : "hover:bg-gray-50"
                  )}
                  style={{
                    ["--tw-ring-color" as string]: theme.colors[500],
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full shadow-md ring-1 ring-black/10"
                    style={{ backgroundColor: theme.colors[500] }}
                  />
                  <span className="text-xs text-gray-600 group-hover:text-gray-900">
                    {theme.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
