"use client";

import { LightButton } from "@/design-system/base/button";
import { authClient } from "@/lib/auth-client";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export function LogoutButton() {
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