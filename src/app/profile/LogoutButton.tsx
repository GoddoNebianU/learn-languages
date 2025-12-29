"use client";

import { LightButton } from "@/components/ui/buttons";
import { authClient } from "@/lib/auth-client";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
    const t = useTranslations("profile");
    const router = useRouter();
    return <LightButton onClick={async () => {
        authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push("/auth?redirect=/profile");
                }
            }
        });
    }}> {t("logout")}</LightButton >;
}