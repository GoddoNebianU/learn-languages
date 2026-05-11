import Link from "next/link";
import { Compass, Folder, Heart, Home, Settings, User } from "lucide-react";
import { LanguageSettings } from "./LanguageSettings";
import { SessionFeatures, UserLink, MobileMenuSession } from "./NavSession";
import { auth } from "@/auth";
import { hasCapability } from "@/lib/capability";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

const navLinkClass =
  "inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors";

export interface NavigationItem {
  label: string;
  href: string;
  icon?: ReactNode;
  external?: boolean;
}

export async function Navbar() {
  const t = await getTranslations("navbar");
  const hasSignup = await hasCapability("signup");
  const hasSocial = await hasCapability("social");
  const hasUserProfile = await hasCapability("userProfile");
  let isLoggedIn: boolean;
  if (!hasSignup) {
    isLoggedIn = true;
  } else {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    isLoggedIn = !!session;
  }

  const loggedInMobileItems: NavigationItem[] = [
    { label: t("folders"), href: "/decks", icon: <Folder size={18} /> },
    ...(hasSocial
      ? [
          { label: t("explore"), href: "/explore", icon: <Compass size={18} /> },
          { label: t("favorites"), href: "/favorites", icon: <Heart size={18} /> },
        ]
      : []),
    { label: t("settings"), href: "/settings", icon: <Settings size={18} /> },
    ...(hasUserProfile
      ? [{ label: t("profile"), href: "/profile", icon: <User size={18} /> }]
      : []),
  ];

  const loggedOutMobileItems: NavigationItem[] = [
    { label: t("folders"), href: "/decks", icon: <Folder size={18} /> },
    { label: t("explore"), href: "/explore", icon: <Compass size={18} /> },
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
        {hasSocial && (
          <Link href="/explore" className={`${navLinkClass} hidden! md:block!`}>
            {t("explore")}
          </Link>
        )}
        {hasSocial && (
          <SessionFeatures
            favoritesLabel={t("favorites")}
            initialSession={isLoggedIn}
          />
        )}
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
