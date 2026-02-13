import Image from "next/image";
import Link from "next/link";
import { PageLayout } from "@/components/ui/PageLayout";
import { LinkButton } from "@/design-system/base/button";
import { actionGetUserProfileByUsername } from "@/modules/auth/auth-action";
import { repoGetFoldersWithTotalPairsByUserId } from "@/modules/folder/folder-repository";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { LogoutButton } from "@/app/users/[username]/LogoutButton";

interface UserPageProps {
    params: Promise<{ username: string; }>;
}

export default async function UserPage({ params }: UserPageProps) {
    const { username } = await params;
    const t = await getTranslations("user_profile");

    // Get current session
    const session = await auth.api.getSession({ headers: await headers() });

    // Get user profile
    const result = await actionGetUserProfileByUsername({ username });

    if (!result.success || !result.data) {
        notFound();
    }

    const user = result.data;

    // Get user's folders
    const folders = await repoGetFoldersWithTotalPairsByUserId(user.id);

    // Check if viewing own profile
    const isOwnProfile = session?.user?.username === username || session?.user?.email === username;

    return (
        <PageLayout>
            {/* Header */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div></div>
                        {isOwnProfile && <LogoutButton />}
                    </div>
                    <div className="flex items-center space-x-6">
                        {/* Avatar */}
                        {user.image ? (
                            <div className="relative w-24 h-24 rounded-full border-4 border-primary-500 overflow-hidden">
                                <Image
                                    src={user.image}
                                    alt={user.displayUsername || user.username || user.email}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            </div>
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-primary-500 border-4 border-primary-500 flex items-center justify-center">
                                <span className="text-3xl font-bold text-white">
                                    {(user.displayUsername || user.username || user.email)[0].toUpperCase()}
                                </span>
                            </div>
                        )}

                        {/* User Info */}
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">
                                {user.displayUsername || user.username || t("anonymous")}
                            </h1>
                            {user.username && (
                                <p className="text-gray-600 text-sm mb-1">
                                    @{user.username}
                                </p>
                            )}
                            <div className="flex items-center space-x-4 text-sm">
                                <span className="text-gray-500">
                                    Joined: {new Date(user.createdAt).toLocaleDateString()}
                                </span>
                                {user.emailVerified && (
                                    <span className="flex items-center text-green-600">
                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 00016zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.293 12.293a1 1 0 101.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        Verified
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Email Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">{t("email")}</h2>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <span className="text-gray-700">{user.email}</span>
                        </div>
                        {user.emailVerified ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                ✓ {t("verified")}
                            </span>
                        ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                                {t("unverified")}
                            </span>
                        )}
                    </div>
                </div>

                {/* Account Info */}
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
                                {new Date(user.createdAt).toLocaleDateString()}
                            </dd>
                        </div>
                    </dl>
                </div>

                {/* Folders Section */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">{t("folders.title")}</h2>
                    {folders.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">{t("folders.noFolders")}</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t("folders.folderName")}
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t("folders.totalPairs")}
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t("folders.createdAt")}
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t("folders.actions")}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {folders.map((folder) => (
                                        <tr key={folder.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{folder.name}</div>
                                                <div className="text-sm text-gray-500">ID: {folder.id}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{folder.total}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(folder.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link href={`/folders/${folder.id}`}>
                                                    <LinkButton>
                                                        {t("folders.view")}
                                                    </LinkButton>
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
