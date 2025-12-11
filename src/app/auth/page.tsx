import { auth } from "@/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AuthForm from "./AuthForm";

export default async function AuthPage(
    props: {
        searchParams: Promise<{ [key: string]: string | string[] | undefined; }>
    }
) {
    const searchParams = await props.searchParams;
    const redirectTo = searchParams.redirect as string | undefined;

    const session = await auth.api.getSession({ headers: await headers() });
    if (session) {
        redirect(redirectTo || '/');
    }

    return <AuthForm redirectTo={redirectTo} />;
}
