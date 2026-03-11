import { Compass, Folder, Heart, Home, Settings, User, Github } from "lucide-react";
import { LanguageSettings } from "./LanguageSettings";
import { MobileMenu } from "./MobileMenu";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { GhostLightButton } from "@/design-system/base/button";
import type { ReactNode } from "react";

export interface NavigationItem {
  label: string;
  href: string;
  icon?: ReactNode;
  external?: boolean;
}

export async function Navbar() {
  const t = await getTranslations("navbar");
  const session = await auth.api.getSession({
    headers: await headers()
  });

  const mobileMenuItems: NavigationItem[] = [
    { label: t("folders"), href: "/decks", icon: <Folder size={18} /> },
    { label: t("explore"), href: "/explore", icon: <Compass size={18} /> },
    ...(session ? [{ label: t("favorites"), href: "/favorites", icon: <Heart size={18} /> }] : []),
    { label: t("sourceCode"), href: "https://github.com/GoddoNebianU/learn-languages", icon: <Github size={18} />, external: true },
    { label: t("settings"), href: "/settings", icon: <Settings size={18} /> },
    ...(session
      ? [{ label: t("profile"), href: "/profile", icon: <User size={18} /> }]
      : [{ label: t("sign_in"), href: "/login", icon: <User size={18} /> }]
    ),
  ];

  return (
    <div className="flex justify-between items-center w-full h-16 px-4 md:px-8 bg-primary-500 text-white">
      <GhostLightButton href="/" className="border-b hidden! md:block!" size="md">
        {t("title")}
      </GhostLightButton>
      <GhostLightButton className="block! md:hidden!" size="md" href="/">
        <Home size={20} />
      </GhostLightButton>
      <div className="flex gap-0.5 justify-center items-center">
        <LanguageSettings />
        <GhostLightButton href="/decks" className="md:block! hidden!" size="md">
          {t("folders")}
        </GhostLightButton>
        <GhostLightButton href="/explore" className="md:block! hidden!" size="md">
          {t("explore")}
        </GhostLightButton>
        {session && (
          <GhostLightButton href="/favorites" className="md:block! hidden!" size="md">
            {t("favorites")}
          </GhostLightButton>
        )}
        <GhostLightButton
          className="hidden! md:block!"
          size="md"
          href="https://github.com/GoddoNebianU/learn-languages"
        >
          {t("sourceCode")}
        </GhostLightButton>
        <GhostLightButton href="/settings" className="hidden! md:block!" size="md">
          {t("settings")}
        </GhostLightButton>
        {session ? (
          <GhostLightButton href="/profile" className="hidden! md:block!" size="md">
            {t("profile")}
          </GhostLightButton>
        ) : (
          <GhostLightButton href="/login" className="hidden! md:block!" size="md">
            {t("sign_in")}
          </GhostLightButton>
        )}
        <div className="md:hidden!">
          <MobileMenu items={mobileMenuItems} />
        </div>
      </div>
    </div>
  );
}
