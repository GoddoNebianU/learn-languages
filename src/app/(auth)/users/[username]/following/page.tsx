import { notFound } from "next/navigation";
import { isSingleUserMode } from "@/lib/auth-mode";
import { getTranslations } from "next-intl/server";
import { PageLayout } from "@/components/ui/PageLayout";
import { UserList } from "@/components/follow/UserList";
import { actionGetUserProfileByUsername } from "@/modules/auth/auth-action";
import { actionGetFollowing } from "@/modules/follow/follow-action";

interface FollowingPageProps {
  params: Promise<{ username: string }>;
}

export default async function FollowingPage({ params }: FollowingPageProps) {
  if (isSingleUserMode()) notFound();
  const { username } = await params;
  const t = await getTranslations("follow");

  const userResult = await actionGetUserProfileByUsername({ username });

  if (!userResult.success || !userResult.data) {
    notFound();
  }

  const user = userResult.data;

  const followingResult = await actionGetFollowing({
    userId: user.id,
    page: 1,
    limit: 50,
  });

  const following =
    followingResult.success && followingResult.data
      ? followingResult.data.following.map((f) => f.user)
      : [];

  return (
    <PageLayout>
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h1 className="mb-6 text-2xl font-bold text-gray-800">
          {t("followingOf", { username: user.displayUsername || user.username || "User" })}
        </h1>
        <UserList users={following} emptyMessage={t("noFollowing")} />
      </div>
    </PageLayout>
  );
}
