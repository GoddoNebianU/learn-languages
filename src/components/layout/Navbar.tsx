import { Compass, Folder, Heart, Home, Settings, User } from "lucide-react";
import { LanguageSettings } from "./LanguageSettings";
import { MobileMenu } from "./MobileMenu";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { Button } from "@/design-system/button";
import type { ReactNode } from "react";

function GithubIcon({ size = 24 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65S8.93 17.38 9 18v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

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
    { label: t("sourceCode"), href: "https://github.com/GoddoNebianU/learn-languages", icon: <GithubIcon size={18} />, external: true },
    { label: t("settings"), href: "/settings", icon: <Settings size={18} /> },
    ...(session
      ? [{ label: t("profile"), href: "/profile", icon: <User size={18} /> }]
      : [{ label: t("sign_in"), href: "/login", icon: <User size={18} /> }]
    ),
  ];

  return (
    <div className="flex justify-between items-center w-full h-16 px-4 md:px-8 bg-primary-500 text-white">
      <Button variant="ghost-light" href="/" className="border-b hidden! md:block!" size="md">
        {t("title")}
      </Button>
      <Button variant="ghost-light" className="block! md:hidden!" size="md" href="/">
        <Home size={20} />
      </Button>
      <div className="flex gap-0.5 justify-center items-center">
        <LanguageSettings />
        <Button variant="ghost-light" href="/decks" className="md:block! hidden!" size="md">
          {t("folders")}
        </Button>
        <Button variant="ghost-light" href="/explore" className="md:block! hidden!" size="md">
          {t("explore")}
        </Button>
        {session && (
          <Button variant="ghost-light" href="/favorites" className="md:block! hidden!" size="md">
            {t("favorites")}
          </Button>
        )}
        <Button variant="ghost-light"
          className="hidden! md:block!"
          size="md"
          href="https://github.com/GoddoNebianU/learn-languages"
        >
          {t("sourceCode")}
        </Button>
        <Button variant="ghost-light" href="/settings" className="hidden! md:block!" size="md">
          {t("settings")}
        </Button>
        {session ? (
          <Button variant="ghost-light" href="/profile" className="hidden! md:block!" size="md">
            {t("profile")}
          </Button>
        ) : (
          <Button variant="ghost-light" href="/login" className="hidden! md:block!" size="md">
            {t("sign_in")}
          </Button>
        )}
        <div className="md:hidden!">
          <MobileMenu items={mobileMenuItems} />
        </div>
      </div>
    </div>
  );
}
