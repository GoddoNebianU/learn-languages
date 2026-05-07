import Link from "next/link";
import { Compass, Folder, Heart, Home, Settings, User } from "lucide-react";
import { LanguageSettings } from "./LanguageSettings";
import { SessionFeatures, UserLink, MobileMenuSession } from "./NavSession";
import { auth } from "@/auth";
import { isSingleUserMode } from "@/lib/auth-mode";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

const navLinkClass =
  "inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors";

function GithubIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
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
  let isLoggedIn: boolean;
  if (isSingleUserMode()) {
    isLoggedIn = true;
  } else {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    isLoggedIn = !!session;
  }

  const loggedInMobileItems: NavigationItem[] = [
    { label: t("folders"), href: "/decks", icon: <Folder size={18} /> },
    { label: t("explore"), href: "/explore", icon: <Compass size={18} /> },
    { label: t("favorites"), href: "/favorites", icon: <Heart size={18} /> },
    {
      label: t("sourceCode"),
      href: "https://github.com/GoddoNebianU/learn-languages",
      icon: <GithubIcon size={18} />,
      external: true,
    },
    { label: t("settings"), href: "/settings", icon: <Settings size={18} /> },
    ...(!isSingleUserMode()
      ? [{ label: t("profile"), href: "/profile", icon: <User size={18} /> }]
      : []),
  ];

  const loggedOutMobileItems: NavigationItem[] = [
    { label: t("folders"), href: "/decks", icon: <Folder size={18} /> },
    { label: t("explore"), href: "/explore", icon: <Compass size={18} /> },
    {
      label: t("sourceCode"),
      href: "https://github.com/GoddoNebianU/learn-languages",
      icon: <GithubIcon size={18} />,
      external: true,
    },
    { label: t("settings"), href: "/settings", icon: <Settings size={18} /> },
    { label: t("sign_in"), href: "/login", icon: <User size={18} /> },
  ];

  return (
    <div className="flex h-16 w-full items-center justify-between bg-primary-500 px-4 text-white md:px-8">
      <Link href="/" className={`${navLinkClass} hidden! border-b md:block!`}>
        {t("title")}
      </Link>
      <Link href="/" className={`${navLinkClass} block! md:hidden!`}>
        <Home size={20} />
      </Link>
      <div className="flex items-center justify-center gap-0.5">
        <LanguageSettings />
        <Link href="/decks" className={`${navLinkClass} hidden! md:block!`}>
          {t("folders")}
        </Link>
        <Link href="/explore" className={`${navLinkClass} hidden! md:block!`}>
          {t("explore")}
        </Link>
        <SessionFeatures
          favoritesLabel={t("favorites")}
          initialSession={isLoggedIn}
        />
        <Link
          href="https://github.com/GoddoNebianU/learn-languages"
          className={`${navLinkClass} hidden! md:block!`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("sourceCode")}
        </Link>
        <Link href="/settings" className={`${navLinkClass} hidden! md:block!`}>
          {t("settings")}
        </Link>
        <UserLink
          profileLabel={t("profile")}
          signInLabel={t("sign_in")}
          settingsLabel={t("settings")}
          initialSession={isLoggedIn}
        />
        <div className="md:hidden!">
          <MobileMenuSession
            loggedInItems={loggedInMobileItems}
            loggedOutItems={loggedOutMobileItems}
            initialSession={isLoggedIn}
          />
        </div>
      </div>
    </div>
  );
}
