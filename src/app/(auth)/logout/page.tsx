import { auth } from "@/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { isSingleUserMode } from "@/lib/auth-mode";

export default async function LogoutPage(props: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  if (isSingleUserMode()) notFound();
  const searchParams = await props.searchParams;
  const redirectTo = searchParams.redirect ?? null;

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session) {
    await auth.api.signOut({
      headers: await headers(),
    });
    redirect("/login" + (redirectTo ? `?redirect=${redirectTo}` : ""));
  } else {
    redirect("/profile");
  }
}
