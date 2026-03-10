import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PageLayout } from "@/components/ui/PageLayout";
import { UserList } from "@/components/follow/UserList";
import { actionGetUserProfileByUsername } from "@/modules/auth/auth-action";
import { actionGetFollowers } from "@/modules/follow/follow-action";

interface FollowersPageProps {
  params: Promise<{ username: string }>;
}

export default async function FollowersPage({ params }: FollowersPageProps) {
  const { username } = await params;
  const t = await getTranslations("follow");

  const userResult = await actionGetUserProfileByUsername({ username });

  if (!userResult.success || !userResult.data) {
    notFound();
  }

  const user = userResult.data;

  const followersResult = await actionGetFollowers({
    userId: user.id,
    page: 1,
    limit: 50,
  });

  const followers = followersResult.success && followersResult.data
    ? followersResult.data.followers.map((f) => f.user)
    : [];

  return (
    <PageLayout>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          {t("followersOf", { username: user.displayUsername || user.username || "User" })}
        </h1>
        <UserList users={followers} emptyMessage={t("noFollowers")} />
      </div>
    </PageLayout>
  );
}
