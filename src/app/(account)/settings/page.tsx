"use client";

import { useTheme } from "@/components/theme-provider";
import { useDensity } from "@/components/density-provider";
import { useTranslations } from "next-intl";
import { cn } from "@/utils/cn";
import { Button } from "@/design-system/button";
import { PageLayout } from "@/components/ui/PageLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { ApiKeysSection } from "./ApiKeysSection";

export default function SettingsPage() {
  const t = useTranslations("settings");
  const { currentTheme, setTheme, availableThemes } = useTheme();
  const { density, setDensity } = useDensity();

  const themeNames: Record<string, string> = {
    teal: t("themeNames.teal"),
    blue: t("themeNames.blue"),
    violet: t("themeNames.violet"),
    rose: t("themeNames.rose"),
    amber: t("themeNames.amber"),
    emerald: t("themeNames.emerald"),
    orange: t("themeNames.orange"),
    slate: t("themeNames.slate"),
    sage: t("themeNames.sage"),
    taupe: t("themeNames.taupe"),
    mauve: t("themeNames.mauve"),
    mist: t("themeNames.mist"),
    dusty: t("themeNames.dusty"),
    olive: t("themeNames.olive"),
  };

  return (
    <PageLayout>
      <PageHeader title={t("title")} subtitle={t("themeColorDescription")} />

      <div>
        <h2 className="mb-3 text-lg font-semibold text-gray-800">{t("themeColor")}</h2>

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
                {themeNames[theme.id] ?? theme.id}
              </span>
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-1 text-lg font-semibold text-gray-800">{t("density")}</h2>
        <p className="mb-3 text-sm text-gray-500">{t("densityDescription")}</p>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="light"
            onClick={() => setDensity("comfortable")}
            className={cn(
              "flex h-auto flex-col items-start gap-1 rounded-lg p-4 transition-all",
              density === "comfortable"
                ? "ring-2 ring-offset-2"
                : "hover:bg-gray-50"
            )}
          >
            <span className="font-semibold text-gray-800">
              {t("densityComfortable")}
            </span>
            <span className="text-xs text-gray-500">
              {t("densityComfortableDescription")}
            </span>
          </Button>
          <Button
            variant="light"
            onClick={() => setDensity("compact")}
            className={cn(
              "flex h-auto flex-col items-start gap-1 rounded-lg p-4 transition-all",
              density === "compact" ? "ring-2 ring-offset-2" : "hover:bg-gray-50"
            )}
          >
            <span className="font-semibold text-gray-800">
              {t("densityCompact")}
            </span>
            <span className="text-xs text-gray-500">
              {t("densityCompactDescription")}
            </span>
          </Button>
        </div>
      </div>

      <ApiKeysSection />
    </PageLayout>
  );
}
