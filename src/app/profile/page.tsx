import Image from "next/image";
import { Center } from "@/components/common/Center";
import Container from "@/components/ui/Container";
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

  console.log(JSON.stringify(session, null, 2));

  return (
    <Center>
      <Container className="p-6">
        <h1>{t("myProfile")}</h1>
        {session.user.image && (
          <Image
            width={64}
            height={64}
            alt="User Avatar"
            src={session.user.image as string}
            className="rounded-4xl"
          ></Image>
        )}
        <p>{session.user.name}</p>
        <p>{t("email", { email: session.user.email })}</p>
        <LogoutButton />
      </Container>
    </Center>
  );
}
