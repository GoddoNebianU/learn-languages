"use client";

import { signOut, useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import DarkButton from "@/components/buttons/DarkButton";
import { useEffect } from "react";
import ACard from "@/components/cards/ACard";
import { Center } from "@/components/Center";
import LightButton from "@/components/buttons/LightButton";

export default function MePage() {
  const session = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (session.status !== "authenticated") {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [session.status, router, pathname]);

  return (
    <Center>
      <ACard>
        <h1>My Profile</h1>
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
        <p>Email: {session.data?.user?.email}</p>
        <DarkButton onClick={signOut}>Logout</DarkButton>
        <LightButton
          onClick={() => {
            fetch("/api/folders", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ name: "New Folder" }),
            }).then(async (res) => console.log(await res.json()));
          }}
        >
          POST
        </LightButton>
      </ACard>
    </Center>
  );
}
