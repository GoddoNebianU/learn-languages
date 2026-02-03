import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/auth?redirect=/profile");
  }

  // 已登录，跳转到用户资料页面
  // 优先使用 username，如果没有则使用 email
  const username = (session.user.username as string) || (session.user.email as string);
  redirect(`/users/${username}`);
}
