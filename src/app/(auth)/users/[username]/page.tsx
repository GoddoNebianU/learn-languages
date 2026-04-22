import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageLayout } from "@/components/ui/PageLayout";
import { Button } from "@/design-system/base/button";
import { actionGetUserProfileByUsername } from "@/modules/auth/auth-action";
import { repoGetDecksByUserId } from "@/modules/deck/deck-repository";
import { actionGetFollowStatus } from "@/modules/follow/follow-action";
import { notFound } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { FollowStats } from "@/components/follow/FollowStats";
import { DeleteAccountButton } from "./DeleteAccountButton";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `${username}'s Profile | Learn Languages`,
    description: `View ${username}'s profile, decks, and activity on Learn Languages.`,
  };
}

interface UserPageProps {
    params: Promise<{ username: string; }>;
}

export default async function UserPage({ params }: UserPageProps) {
    const { username } = await params;
    const t = await getTranslations("user_profile");
    const locale = await getLocale();

    const session = await auth.api.getSession({ headers: await headers() });

    const result = await actionGetUserProfileByUsername({ username });

    if (!result.success || !result.data) {
        notFound();
    }

    const user = result.data;

    const [decks, followStatus] = await Promise.all([
        repoGetDecksByUserId({ userId: user.id }),
        actionGetFollowStatus({ targetUserId: user.id }),
    ]);

    const isOwnProfile = session?.user?.username === username || session?.user?.email === username;

    const followersCount = followStatus.success && followStatus.data ? followStatus.data.followersCount : 0;
    const followingCount = followStatus.success && followStatus.data ? followStatus.data.followingCount : 0;
    const isFollowing = followStatus.success && followStatus.data ? followStatus.data.isFollowing : false;

    return (
        <PageLayout>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div></div>
                    <div className="flex items-center gap-3">
                        {isOwnProfile && (
                            <>
                                <Button variant="link" href="/logout">{t("logout")}</Button>
                                <DeleteAccountButton username={username} />
                            </>
                        )}
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                    {user.image ? (
                        <div className="relative w-24 h-24 rounded-full border-4 border-primary-500 overflow-hidden flex-shrink-0">
                            <Image
                                src={user.image}
                                alt={user.displayUsername || user.username || user.email}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        </div>
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-primary-500 border-4 border-primary-500 flex items-center justify-center flex-shrink-0">
                            <span className="text-3xl font-bold text-white">
                                {(user.displayUsername || user.username || user.email)[0].toUpperCase()}
                            </span>
                        </div>
                    )}

                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            {user.displayUsername || user.username || t("anonymous")}
                        </h1>
                        {user.username && (
                            <p className="text-gray-600 text-sm mb-1">
                                @{user.username}
                            </p>
                        )}
                        {user.bio && (
                            <p className="text-gray-700 mt-2 mb-2">
                                {user.bio}
                            </p>
                        )}
                        <div className="flex flex-wrap items-center gap-4 text-sm mt-3">
                            <span className="text-gray-500">
                                {t("joined")}: {new Date(user.createdAt).toLocaleDateString(locale)}
                            </span>
                            {user.emailVerified && (
                                <span className="flex items-center text-green-600">
                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.293 12.293a1 1 0 101.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
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

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">{t("accountInfo")}</h2>
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <dt className="text-sm font-medium text-gray-500">{t("userId")}</dt>
                        <dd className="mt-1 text-sm text-gray-900 font-mono break-all">{user.id}</dd>
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

            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">{t("decks.title")}</h2>
                {decks.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">{t("decks.noDecks")}</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t("decks.deckName")}
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t("decks.totalCards")}
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t("decks.createdAt")}
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t("decks.actions")}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {decks.map((deck) => (
                                    <tr key={deck.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{deck.name}</div>
                                            <div className="text-sm text-gray-500">ID: {deck.id}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{deck.cardCount ?? 0}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(deck.createdAt).toLocaleDateString(locale)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link href={`/decks/${deck.id}`}>
                                                <Button variant="link">
                                                    {t("decks.view")}
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </PageLayout>
    );
}
