import Image from "next/image";
import PageLayout from "@/components/ui/PageLayout";
import PageHeader from "@/components/ui/PageHeader";
import { auth } from "@/auth";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import LogoutButton from "./LogoutButton";

export default async function ProfilePage() {
  const t = await getTranslations("profile");

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/auth?redirect=/profile");
  }

  return (
    <PageLayout>
      <PageHeader title={t("myProfile")} />

      {/* 用户信息区域 */}
      <div className="flex flex-col items-center gap-4">
        {/* 用户头像 */}
        {session.user.image && (
          <Image
            width={80}
            height={80}
            alt="User Avatar"
            src={session.user.image as string}
            className="rounded-full"
          />
        )}

        {/* 用户名和邮箱 */}
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800">
            {session.user.name}
          </h2>
          <p className="text-gray-600">{t("email", { email: session.user.email })}</p>
        </div>

        {/* 登出按钮 */}
        <LogoutButton />
      </div>
    </PageLayout>
  );
}
