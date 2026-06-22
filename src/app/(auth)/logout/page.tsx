import { auth } from "@/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { hasCapability } from "@/lib/capability";
import { logActivity } from "@/modules/activity/activity-service";
import { ACTIVITY_ACTIONS } from "@/modules/activity/activity-constants";

export default async function LogoutPage(props: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  if (!(await hasCapability("signup"))) notFound();
  const searchParams = await props.searchParams;
  const redirectTo = searchParams.redirect ?? null;

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session) {
    await logActivity({
      userId: session.user.id,
      action: ACTIVITY_ACTIONS.AUTH.LOGOUT,
      entityType: "session",
    });
    await auth.api.signOut({
      headers: await headers(),
    });
    redirect("/login" + (redirectTo ? `?redirect=${redirectTo}` : ""));
  } else {
    redirect("/profile");
  }
}
