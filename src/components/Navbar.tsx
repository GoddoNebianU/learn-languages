import Link from "next/link";
import Image from "next/image";
import IMAGES from "@/config/images";
import { Folder, Home } from "lucide-react";
import LanguageSettings from "./LanguageSettings";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";

export async function Navbar() {
  const t = await getTranslations("navbar");
  const session = await auth.api.getSession({
    headers: await headers()
  });

  return (
    <div className="flex justify-between items-center w-full h-16 px-8 bg-[#35786f] text-white">
      <Link href={"/"} className="text-xl border-b hidden md:block">
        {t("title")}
      </Link>
      <Link className="block md:hidden" href={"/"}>
        <Home />
      </Link>
      <div className="flex gap-4 text-xl justify-center items-center flex-wrap">
        <Link
          className="md:hidden block"
          href="https://github.com/GoddoNebianU/learn-languages"
        >
          <Image
            src={IMAGES.github_mark_white}
            alt="GitHub"
            width={24}
            height={24}
          />
        </Link>
        <LanguageSettings />
        <Link href="/folders" className="md:block hidden">
          {t("folders")}
        </Link>
        <Link href="/folders" className="md:hidden block">
          <Folder />
        </Link>
        {
          (() => {
            return session &&
              <Link href="/profile">{t("profile")}</Link>
              || <Link href="/signin">{t("sign_in")}</Link>;

          })()
        }
        <Link href="/changelog.txt">{t("about")}</Link>
        <Link
          className="hidden md:block"
          href="https://github.com/GoddoNebianU/learn-languages"
        >
          {t("sourceCode")}
        </Link>
      </div>
    </div>
  );
}
