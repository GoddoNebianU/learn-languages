import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { actionGetUserProfileByUsername } from "@/modules/auth/auth-action";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

interface UserPageProps {
    params: Promise<{ username: string; }>;
}

export default async function UserPage({ params }: UserPageProps) {
    const { username } = await params;
    const t = await getTranslations("user_profile");

    // Get user profile
    const result = await actionGetUserProfileByUsername({ username });

    if (!result.success || !result.data) {
        notFound();
    }

    const user = result.data;

    return (
        <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-8">
            <Container className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex items-center space-x-6">
                        {/* Avatar */}
                        {user.image ? (
                            <div className="relative w-24 h-24 rounded-full border-4 border-[#35786f] overflow-hidden">
                                <Image
                                    src={user.image}
                                    alt={user.displayUsername || user.username || user.email}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            </div>
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-[#35786f] border-4 border-[#35786f] flex items-center justify-center">
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
                <div className="bg-white rounded-lg shadow-md p-6">
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
            </Container>
        </div>
    );
}
