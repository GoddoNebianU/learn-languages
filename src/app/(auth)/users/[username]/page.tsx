import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageLayout } from "@/components/ui/PageLayout";
import { Button } from "@/design-system/button";
import { LinkButton } from "@/design-system/link-button";
import { Table, THead, TBody, TR, TH, TD } from "@/design-system/table";
import { actionGetUserProfileByUsername } from "@/modules/auth/auth-action";
import { actionGetDecksByUserId } from "@/modules/deck/deck-action";
import { actionGetFollowStatus } from "@/modules/follow/follow-action";
import { notFound } from "next/navigation";
import { hasCapability } from "@/lib/capability";
import { getTranslations, getLocale } from "next-intl/server";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { FollowStats } from "@/components/follow/FollowStats";
import { BadgeCheck } from "lucide-react";
import { DeleteAccountButton } from "./DeleteAccountButton";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `${username}'s Profile | Learn Languages`,
    description: `View ${username}'s profile, decks, and activity on Learn Languages.`,
  };
}

interface UserPageProps {
  params: Promise<{ username: string }>;
}

export default async function UserPage({ params }: UserPageProps) {
  if (!(await hasCapability("userProfile"))) notFound();
  const { username } = await params;
  const t = await getTranslations("user_profile");
  const locale = await getLocale();

  const session = await auth.api.getSession({ headers: await headers() });

  const result = await actionGetUserProfileByUsername({ username });

  if (!result.success || !result.data) {
    notFound();
  }

  const user = result.data;

  const [decksResult, followStatus] = await Promise.all([
    actionGetDecksByUserId({ userId: user.id }),
    actionGetFollowStatus({ targetUserId: user.id }),
  ]);

  const decks = decksResult.success && decksResult.data ? decksResult.data : [];

  const isOwnProfile = session?.user?.username === username || session?.user?.email === username;

  const followersCount =
    followStatus.success && followStatus.data ? followStatus.data.followersCount : 0;
  const followingCount =
    followStatus.success && followStatus.data ? followStatus.data.followingCount : 0;
  const isFollowing =
    followStatus.success && followStatus.data ? followStatus.data.isFollowing : false;

  return (
    <PageLayout>
      <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <div></div>
          <div className="flex items-center gap-3">
            {isOwnProfile && (
              <>
                <LinkButton href="/logout">{t("logout")}</LinkButton>
                <DeleteAccountButton username={username} />
              </>
            )}
          </div>
        </div>
        <div className="flex flex-col items-start space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-6">
          {user.image ? (
            <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-full border-4 border-primary-500">
              <Image
                src={user.image}
                alt={user.displayUsername || user.username || t("anonymous")}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full border-4 border-primary-500 bg-primary-500">
              <span className="text-3xl font-bold text-white">
                {(user.displayUsername || user.username || t("anonymous"))[0].toUpperCase()}
              </span>
            </div>
          )}

          <div className="flex-1">
            <h1 className="mb-2 text-3xl font-bold text-gray-800">
              {user.displayUsername || user.username || t("anonymous")}
            </h1>
            {user.username && <p className="mb-1 text-sm text-gray-600">@{user.username}</p>}
            {user.bio && <p className="mt-2 mb-2 text-gray-700">{user.bio}</p>}
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
              <span className="text-gray-500">
                {t("joined")}: {new Date(user.createdAt).toLocaleDateString(locale)}
              </span>
              {user.emailVerified && (
                <span className="flex items-center text-green-600">
                  <BadgeCheck className="mr-1 h-4 w-4" />
                  {t("verified")}
                </span>
              )}
            </div>
            <div className="mt-3">
              <FollowStats
                userId={user.id}
                initialFollowersCount={followersCount}
                initialFollowingCount={followingCount}
                initialIsFollowing={isFollowing}
                currentUserId={session?.user?.id}
                isOwnProfile={isOwnProfile}
                username={user.username || user.id}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold text-gray-800">{t("accountInfo")}</h2>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">{t("userId")}</dt>
            <dd className="mt-1 font-mono text-sm break-all text-gray-900">{user.id}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">{t("username")}</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {user.username || <span className="text-gray-400">{t("notSet")}</span>}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">{t("displayName")}</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {user.displayUsername || <span className="text-gray-400">{t("notSet")}</span>}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">{t("memberSince")}</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Date(user.createdAt).toLocaleDateString(locale)}
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold text-gray-800">{t("decks.title")}</h2>
        {decks.length === 0 ? (
          <p className="py-8 text-center text-gray-500">{t("decks.noDecks")}</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <THead>
                <TR>
                  <TH scope="col">{t("decks.deckName")}</TH>
                  <TH scope="col">{t("decks.totalCards")}</TH>
                  <TH scope="col">{t("decks.createdAt")}</TH>
                  <TH scope="col" className="text-right">{t("decks.actions")}</TH>
                </TR>
              </THead>
              <TBody>
                {decks.map((deck) => (
                  <TR key={deck.id} className="hover:bg-gray-50">
                    <TD className="whitespace-nowrap">
                      <div className="font-medium text-gray-900">{deck.name}</div>
                      <div className="text-gray-500">ID: {deck.id}</div>
                    </TD>
                    <TD className="whitespace-nowrap">{deck.cardCount ?? 0}</TD>
                    <TD className="whitespace-nowrap">
                      {new Date(deck.createdAt).toLocaleDateString(locale)}
                    </TD>
                    <TD className="whitespace-nowrap text-right">
                      <Link href={`/decks/${deck.id}`}>
                        <LinkButton>{t("decks.view")}</LinkButton>
                      </Link>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
