import { auth } from "@/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function LogoutPage(
    props: {
        searchParams: Promise<{ [key: string]: string | undefined; }>;
    }
) {
    const searchParams = await props.searchParams;
    const redirectTo = searchParams.redirect ?? null;

    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (session) {
        await auth.api.signOut({
            headers: await headers()
        });
        redirect("/login" + (redirectTo ? `?redirect=${redirectTo}` : ""));
    } else {
        redirect("/profile");
    }
}