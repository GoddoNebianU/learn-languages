"use client";

import LightButton from "@/components/buttons/LightButton";
import { Center } from "@/components/Center";
import IMAGES from "@/config/images";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const session = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (session.status === "authenticated") {
      router.push(searchParams.get("redirect") || "/");
    }
  }, [session.status, router, searchParams]);

  return (
    <Center>
      {session.status === "loading" ? (
        <div>Loading...</div>
      ) : (
        <LightButton
          className="flex flex-row p-2 gap-2"
          onClick={() => signIn("github")}
        >
          <Image
            src={IMAGES.github_mark}
            alt="GitHub Logo"
            width={32}
            height={32}
          />
          <span>GitHub Login</span>
        </LightButton>
      )}
    </Center>
  );
}
