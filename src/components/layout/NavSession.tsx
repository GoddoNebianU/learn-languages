"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { MobileMenu } from "./MobileMenu";
import type { NavigationItem } from "./Navbar";

const navLinkClass =
  "inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-white hover:bg-white/10 transition-colors";

function useIsLoggedIn(initialSession: boolean) {
  const { data: session, isPending } = authClient.useSession();
  return isPending ? initialSession : !!session;
}

interface SessionFeaturesProps {
  favoritesLabel: string;
  initialSession: boolean;
}

export function SessionFeatures({
  favoritesLabel,
  initialSession,
}: SessionFeaturesProps) {
  const isLoggedIn = useIsLoggedIn(initialSession);

  if (!isLoggedIn) return null;

  return (
    <Link
      href="/favorites"
      className={`${navLinkClass} hidden! md:block!`}
    >
      {favoritesLabel}
    </Link>
  );
}

interface UserLinkProps {
  profileLabel: string;
  signInLabel: string;
  initialSession: boolean;
}

export function UserLink({
  profileLabel,
  signInLabel,
  initialSession,
}: UserLinkProps) {
  const isLoggedIn = useIsLoggedIn(initialSession);

  return isLoggedIn ? (
    <Link href="/profile" className={`${navLinkClass} hidden! md:block!`}>
      {profileLabel}
    </Link>
  ) : (
    <Link href="/login" className={`${navLinkClass} hidden! md:block!`}>
      {signInLabel}
    </Link>
  );
}

interface MobileMenuSessionProps {
  loggedInItems: NavigationItem[];
  loggedOutItems: NavigationItem[];
  initialSession: boolean;
}

export function MobileMenuSession({
  loggedInItems,
  loggedOutItems,
  initialSession,
}: MobileMenuSessionProps) {
  const isLoggedIn = useIsLoggedIn(initialSession);
  const items = isLoggedIn ? loggedInItems : loggedOutItems;
  return <MobileMenu items={items} />;
}
