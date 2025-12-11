import Image from "next/image";
import IMAGES from "@/config/images";
import { Folder, Home } from "lucide-react";
import LanguageSettings from "../LanguageSettings";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import GhostButton from "../ui/buttons/GhostButton";

export async function Navbar() {
  const t = await getTranslations("navbar");
  const session = await auth.api.getSession({
    headers: await headers()
  });

  return (
    <div className="flex justify-between items-center w-full h-16 px-8 bg-[#35786f] text-white">
      <GhostButton href="/" className="text-xl border-b hidden md:block">
        {t("title")}
      </GhostButton>
      <GhostButton className="block md:hidden" href={"/"}>
        <Home />
      </GhostButton>
      <div className="flex text-xl gap-0.5 justify-center items-center flex-wrap">
        <GhostButton
          className="md:hidden block"
          href="https://github.com/GoddoNebianU/learn-languages"
        >
          <Image
            src={IMAGES.github_mark_white}
            alt="GitHub"
            width={24}
            height={24}
          />
        </GhostButton>
        <LanguageSettings />
        <GhostButton href="/folders" className="md:block hidden">
          {t("folders")}
        </GhostButton>
        <GhostButton href="/folders" className="md:hidden block">
          <Folder />
        </GhostButton>
        {
          (() => {
            return session &&
              <GhostButton href="/profile">{t("profile")}</GhostButton>
              || <GhostButton href="/auth">{t("sign_in")}</GhostButton>;

          })()
        }
        <GhostButton href="/changelog.txt">{t("about")}</GhostButton>
        <GhostButton
          className="hidden md:block"
          href="https://github.com/GoddoNebianU/learn-languages"
        >
          {t("sourceCode")}
        </GhostButton>
      </div>
    </div>
  );
}
