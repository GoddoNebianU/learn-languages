"use client";

import { signOut, useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect } from "react";
import { Center } from "@/components/Center";
import Container from "@/components/cards/Container";
import LightButton from "@/components/buttons/LightButton";
import { useTranslations } from "next-intl";

export default function MePage() {
  const session = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("profile");

  useEffect(() => {
    if (session.status !== "authenticated") {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [session.status, router, pathname]);

  return (
    <Center>
      <Container className="p-6">
        <h1>{t("myProfile")}</h1>
        {(session.data?.user?.image as string) && (
          <Image
            width={64}
            height={64}
            alt="User Avatar"
            src={session.data?.user?.image as string}
            className="rounded-4xl"
          ></Image>
        )}
        <p>{session.data?.user?.name}</p>
        <p>{t("email", { email: session.data!.user!.email as string })}</p>
        <LightButton onClick={signOut}>{t("logout")}</LightButton>
      </Container>
    </Center>
  );
}
